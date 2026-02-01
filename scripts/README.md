# E2E Testing Scripts

Scripts para configurar el ambiente de testing end-to-end con data realista.

## 🚀 Quick Start

Para configurar todo el ambiente de testing de una vez:

```bash
python3 scripts/setup_e2e_env.py
```

Este script ejecuta todos los pasos en orden y configura:
- 15 predicciones para alice@example.com
- 10 partidos terminados con scores y puntos calculados
- 1 partido en vivo
- Escenarios de testing (deadlines, diferentes stages/groups)

## 📜 Scripts Individuales

### 1. `seed_predictions.py`

Crea predicciones para el usuario alice@example.com.

```bash
# Crear 20 predicciones (default)
python3 scripts/seed_predictions.py

# Crear cantidad específica
python3 scripts/seed_predictions.py --count 15
```

**Características:**
- Borra predicciones existentes de alice antes de crear nuevas
- Selecciona partidos sin equipos TBD
- Genera scores realistas (0-4 goles, weighted hacia scores bajos)
- Ordena por fecha

### 2. `update_match_status.py`

Marca partidos como finalizados y calcula puntos de predicciones.

```bash
# Marcar 10 partidos como finished (default)
python3 scripts/update_match_status.py

# Marcar cantidad específica
python3 scripts/update_match_status.py --count 8
```

**Características:**
- Prioriza partidos que tienen predicciones
- Usa scores realistas (algunos presets + random weighted)
- Calcula puntos automáticamente usando la misma lógica del backend:
  - 5 pts: Resultado exacto
  - 3 pts: Ganador + diferencia de goles correcta
  - 2 pts: Un score correcto
  - 1 pt: Solo ganador correcto
  - 0 pts: Sin aciertos
- Marca predicciones como `notified=0` (aparecen en NotificationCenter)

### 3. `create_test_scenarios.py`

Crea escenarios específicos para testing de edge cases.

```bash
python3 scripts/create_test_scenarios.py
```

**Escenarios creados:**
1. **Match en 30 minutos**: Deadline pasado (not editable)
2. **Match en 2 horas**: Aún editable
3. **Match LIVE**: Status=live con scores parciales (1-0)
4. **Stages diferentes**: Group Stage, Round of 16, Quarter-finals, Semi-finals
5. **Groups diferentes**: A-H para testing de filtros
6. **Matches hoy**: 3 partidos en diferentes horarios

### 4. `setup_e2e_env.py`

Script maestro que ejecuta todos los anteriores en orden.

```bash
python3 scripts/setup_e2e_env.py
```

## 📊 Data Generada

Después de ejecutar `setup_e2e_env.py`:

### Usuario de Testing
- **Email**: alice@example.com
- **Password**: password123
- **User ID**: user-1

### Predicciones
- **Total**: 15 predicciones
- **Con puntos**: 10 (matches finished)
- **Pending**: 5 (matches upcoming)
- **Perfect scores (5pts)**: 2
- **Total puntos**: ~21

### Matches
- **Total**: 109 partidos
- **Upcoming**: ~98
- **Live**: 1
- **Finished**: 10

### Notificaciones
- **Unread**: 10 (todas las predicciones con puntos calculados)

## 🧪 Testing Checklist

Después de setup, testear:

1. **Login**
   - Login como alice@example.com
   - Verificar que no se abra NotificationCenter automáticamente

2. **Ver Partidos Page**
   - ✅ Se ven 109 partidos
   - ✅ Stats cards muestran números correctos
   - ✅ Filtros funcionan (status, stage, group, search)
   - ✅ Icono de notificaciones muestra badge (10)
   - ✅ Click en notificaciones abre el drawer
   - ✅ Drawer se puede cerrar (X o backdrop)
   - ✅ Predictions se guardan correctamente
   - ✅ Matches editable/not editable según deadline

3. **Mis Predicciones Page**
   - ✅ Se ven 15 predicciones
   - ✅ Stats cards correctos (21 pts total, 2 perfect)
   - ✅ Tabs funcionan (All, Pending, Live, Finished)
   - ✅ Color badges correctos (5pts=amarillo, 3-4pts=verde, 1-2pts=azul, 0pts=gris)
   - ✅ Tabla responsive (desktop) → Cards (mobile)

4. **NotificationCenter**
   - ✅ Muestra 10 notificaciones
   - ✅ Cada notificación muestra score, puntos, breakdown
   - ✅ Se puede cerrar correctamente
   - ✅ No se abre automáticamente

## 🔄 Reset Data

Para limpiar y resetear data:

```bash
# Opción 1: Re-run setup (borra y recrea)
python3 scripts/setup_e2e_env.py

# Opción 2: Borrar predictions manualmente
python3 -c "
import sqlite3
conn = sqlite3.connect('backend/app.db')
conn.execute('DELETE FROM predictions WHERE userId = \"user-1\"')
conn.commit()
conn.close()
print('✅ Deleted alice predictions')
"

# Opción 3: Reset match statuses
python3 -c "
import sqlite3
conn = sqlite3.connect('backend/app.db')
conn.execute('UPDATE matches SET status = \"upcoming\", homeScore = NULL, awayScore = NULL WHERE manualOverride = 1')
conn.commit()
conn.close()
print('✅ Reset matches to upcoming')
"
```

## 🛠️ Troubleshooting

### "No matches found"
Si los scripts no encuentran matches, verifica que la base de datos tenga matches:
```bash
python3 -c "import sqlite3; conn = sqlite3.connect('backend/app.db'); print('Matches:', conn.execute('SELECT COUNT(*) FROM matches').fetchone()[0])"
```

### "Database locked"
Si el backend está corriendo, puede bloquear la DB. Para el backend primero:
```bash
pkill -f "uvicorn app.main:app"
```

### Timestamps deprecation warning
El warning de `datetime.utcnow()` es esperado y no afecta funcionalidad. Se puede ignorar.

## 📝 Notes

- Los scripts son **idempotentes**: `seed_predictions.py` borra predictions existentes antes de crear nuevas
- Los matches con `manualOverride=1` fueron modificados por scripts (fácil de identificar)
- Todas las fechas usan ISO format para compatibilidad con SQLite
- Points calculation usa la misma lógica que el backend (`backend/app/routers/predictions.py`)
