import { Clock, Users, Sparkles } from 'lucide-react';

export const QueueCard = ({ customer, prediction }) => {
  const statusColors = {
    WAITING: 'bg-amber-100 text-amber-800 border-amber-200',
    SEATED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  const positionColor = customer?.position === 1
    ? 'from-amber-400 to-orange-600'
    : 'from-gray-700 to-gray-900';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Token Section */}
      <div className={`bg-gradient-to-br ${positionColor} p-8 text-center`}>
        <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">
          Your Queue Token
        </p>
        <h1 className="text-5xl font-bold text-white tracking-tight">
          {customer?.queueToken || 'SG-000'}
        </h1>
      </div>

      {/* Position Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">Party Size</span>
          </div>
          <span className="text-2xl font-semibold text-gray-800">
            {customer?.partySize || 0}
          </span>
        </div>

        {customer?.status === 'WAITING' && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 rounded-full p-2">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Current Position</p>
                <p className="text-3xl font-bold text-amber-900">
                  #{customer?.position || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {customer?.status === 'SEATED' && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-lg font-semibold text-emerald-800">
              Your table is ready!
            </p>
            <p className="text-sm text-emerald-600">
              Please proceed to the host.
            </p>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="p-4 bg-gray-50">
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[customer?.status] || statusColors.WAITING}`}>
          {customer?.status || 'WAITING'}
        </span>
      </div>
    </div>
  );
};

export const WaitEstimateCard = ({ prediction }) => {
  if (!prediction) return null;

  const confidenceColors = {
    high: 'text-emerald-600 bg-emerald-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-500">AI Wait Estimate</span>
        </div>
        <span className="text-xs text-gray-400">Powered by Groq AI</span>
      </div>

      <div className="mb-4">
        <p className="text-4xl font-bold text-gray-800 mb-1">
          {prediction.waitRange}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${confidenceColors[prediction.confidence]}`}>
            {prediction.confidence} confidence
          </span>
          {prediction.peakHourWarning && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 animate-pulse">
              Peak Hours
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {prediction.reasoning}
      </p>
    </div>
  );
};
