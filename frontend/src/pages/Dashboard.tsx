export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sample Metrics Cards following design rules (quiet, focused) */}
        {[
          { label: 'Total Active Leads', value: '124' },
          { label: 'Projects in Execution', value: '18' },
          { label: 'Outstanding Payments', value: '$45,000' },
        ].map((metric) => (
          <div key={metric.label} className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
