# Sensor Monitor Module (Standalone)

This folder is intentionally standalone and is **not wired** into dashboard routes yet.

## Files

- `sensor-monitor.constants.js`: metric metadata
- `sensor-monitor.parser.js`: parser and normalization for API/serial payloads
- `sensor-monitor-cards.jsx`: latest-value cards
- `sensor-monitor-charts.jsx`: trend graphs
- `sensor-monitor-module.jsx`: wrapper component
- `use-sensor-monitor.js` (in `src/hooks`): source-agnostic data stream hook

## How To Mount In Dashboard Later

1. Import module in the page where you want it:

```jsx
import { SensorMonitorModule } from "@/components/monitoring/sensor-monitor-module";
```

2. Render with API source:

```jsx
<SensorMonitorModule getToken={getToken} source="api" />
```

3. Render with Serial source (browser Web Serial):

```jsx
<SensorMonitorModule source="serial" />
```

## Serial Monitor Input Format

The parser accepts either JSON or key-value lines.

1. JSON line:

```text
{"soilMoisture":42,"humidity":58,"temperature":31}
```

2. Key-value line:

```text
soil:42,humidity:58,temp:31
```

## Arduino Serial Example

```cpp
void loop() {
  int soil = analogRead(A0);     // map this to percentage in your code
  float humidity = 58.0;
  float temperature = 31.2;

  Serial.print("soil:");
  Serial.print(soil);
  Serial.print(",humidity:");
  Serial.print(humidity);
  Serial.print(",temp:");
  Serial.println(temperature);

  delay(2000);
}
```

## Will Graphs Auto-Update?

Yes.

- `source="api"`: updates on polling interval (default 15s)
- `source="serial"`: updates whenever a new serial line arrives

Every parsed reading is appended to feed and chart redraws automatically.