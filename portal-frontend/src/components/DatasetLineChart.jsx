import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Format angka grafik mengikuti format Indonesia agar sama dengan tabel dataset.
function formatNumberLabel(value) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default function DatasetLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <LineChart data={data} margin={{ top: 24, right: 32, left: 14, bottom: 20 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="year" label={{ value: "Tahun", position: "insideBottom", offset: -12 }} tickLine={false} />
        <YAxis
          // Sumbu Y disingkat ribuan supaya grafik tetap ringkas.
          tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
          label={{ value: "Jumlah", angle: -90, position: "insideLeft" }}
          tickLine={false}
        />
        <Tooltip formatter={(value) => [formatNumberLabel(value), "Jumlah"]} labelFormatter={(label) => `Tahun ${label}`} />
        <Line
          type="monotone"
          dataKey="jumlah"
          stroke="#2aa8ff"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#2aa8ff", strokeWidth: 0 }}
          activeDot={{ r: 7 }}
          label={{ position: "top", formatter: formatNumberLabel, fill: "#000", fontWeight: 700, fontSize: 12 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
