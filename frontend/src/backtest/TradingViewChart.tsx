import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, Time } from 'lightweight-charts';
import type { Kline, Trade } from './types';
import './TradingViewChart.css';

interface TradingViewChartProps {
  klines: Kline[];
  trades: Trade[];
  equityCurve?: { timestamp: string; equity: number }[];
}

const lightTheme = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#475569',
  },
  grid: {
    vertLines: { color: 'rgba(0, 0, 0, 0.06)' },
    horzLines: { color: 'rgba(0, 0, 0, 0.06)' },
  },
  crosshair: {
    mode: 1,
  },
  timeScale: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    visible: true,
  },
  rightPriceScale: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
};

const darkTheme = {
  layout: {
    background: { color: '#12121a' },
    textColor: '#a1a1aa',
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.06)' },
    horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
  },
  crosshair: {
    mode: 1,
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    visible: true,
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};

function formatTimeToUTC(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TradingViewChart({ klines, trades, equityCurve }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const equityContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equityChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      return;
    }

    const theme = isDark ? darkTheme : lightTheme;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(container, {
      ...theme,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    setChartsReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!equityContainerRef.current) return;

    const container = equityContainerRef.current;
    if (container.clientWidth === 0) {
      return;
    }

    const theme = isDark ? darkTheme : lightTheme;

    if (equityChartRef.current) {
      equityChartRef.current.remove();
    }

    const equityChart = createChart(container, {
      ...theme,
      width: container.clientWidth,
      height: 120,
      timeScale: {
        ...theme.timeScale,
        visible: false,
      },
    });

    const equitySeries = equityChart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
    });

    equityChartRef.current = equityChart;
    equitySeriesRef.current = equitySeries;

    if (chartRef.current && equityChartRef.current) {
      chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
        if (timeRange) {
          equityChartRef.current?.timeScale().setVisibleLogicalRange(timeRange);
        }
      });

      equityChartRef.current.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
        if (timeRange) {
          chartRef.current?.timeScale().setVisibleLogicalRange(timeRange);
        }
      });
    }

    const handleResize = () => {
      if (equityContainerRef.current && equityChartRef.current) {
        equityChartRef.current.applyOptions({
          width: equityContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (equityChartRef.current) {
        equityChartRef.current.remove();
        equityChartRef.current = null;
        equitySeriesRef.current = null;
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !klines.length || !chartsReady) return;

    try {
      const timeMap = new Map<string, CandlestickData>();
      
      klines.forEach((k) => {
        const time = formatTimeToUTC(k.open_time);
        if (!timeMap.has(time)) {
          timeMap.set(time, {
            time: time as Time,
            open: k.open,
            high: k.high,
            low: k.low,
            close: k.close,
          });
        }
      });

      const candleData = Array.from(timeMap.values()).sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
        return timeA - timeB;
      });

      candlestickSeriesRef.current.setData(candleData);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('Failed to set candlestick data:', err);
    }
  }, [klines, chartsReady]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !trades.length || !chartsReady) return;

    try {
      const timeMap = new Map<string, { time: Time; position: 'belowBar' | 'aboveBar'; color: string; shape: 'arrowUp' | 'arrowDown'; text: string }>();

      trades.forEach((t) => {
        const time = formatTimeToUTC(t.timestamp);
        if (!timeMap.has(time)) {
          if (t.type === 'buy') {
            timeMap.set(time, {
              time: time as Time,
              position: 'belowBar',
              color: '#10b981',
              shape: 'arrowUp',
              text: 'B',
            });
          } else {
            timeMap.set(time, {
              time: time as Time,
              position: 'aboveBar',
              color: '#f43f5e',
              shape: 'arrowDown',
              text: 'S',
            });
          }
        }
      });

      const markers = Array.from(timeMap.values()).sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
        return timeA - timeB;
      });

      candlestickSeriesRef.current.setMarkers(markers);
    } catch (err) {
      console.error('Failed to set trade markers:', err);
    }
  }, [trades, chartsReady]);

  useEffect(() => {
    if (!equitySeriesRef.current || !equityCurve?.length || !chartsReady) return;

    try {
      const timeMap = new Map<string, LineData>();

      equityCurve.forEach((p) => {
        const time = formatTimeToUTC(p.timestamp);
        if (!timeMap.has(time)) {
          timeMap.set(time, {
            time: time as Time,
            value: p.equity,
          });
        }
      });

      const equityData = Array.from(timeMap.values()).sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
        return timeA - timeB;
      });

      equitySeriesRef.current.setData(equityData);
      equityChartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('Failed to set equity curve data:', err);
    }
  }, [equityCurve, chartsReady]);

  return (
    <div className="tradingview-chart-container">
      <div className="chart-header">
        <span className="chart-title">K线图表</span>
        {klines.length > 0 && (
          <span className="chart-info">
            {klines[0]?.open_time?.slice(0, 10)} ~ {klines[klines.length - 1]?.open_time?.slice(0, 10)}
          </span>
        )}
      </div>
      <div className="chart-wrapper" ref={chartContainerRef} />
      <div className="equity-header">
        <span className="chart-title">权益曲线</span>
      </div>
      <div className="equity-wrapper" ref={equityContainerRef} />
      <div className="trades-section">
        <h4 className="section-title">成交记录 ({trades?.length || 0})</h4>
        <div className="trades-table-wrapper">
          <table className="trades-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>价格</th>
                <th>数量</th>
                <th>手续费</th>
                <th>持币</th>
                <th>持仓市值</th>
                <th>当前金额</th>
                <th>总市值</th>
              </tr>
            </thead>
            <tbody>
              {!trades || trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-trades">暂无成交记录</td>
                </tr>
              ) : (
                trades.map((trade, index) => (
                  <tr key={index} className={trade.type === 'buy' ? 'trade-buy' : 'trade-sell'}>
                    <td>{trade.timestamp?.slice(0, 16) || '-'}</td>
                    <td>
                      <span className={`trade-type ${trade.type}`}>
                        {trade.type === 'buy' ? '买入' : '卖出'}
                      </span>
                    </td>
                    <td>${trade.price?.toLocaleString() || 0}</td>
                    <td>{trade.amount?.toFixed(4) || 0}</td>
                    <td>${trade.fee?.toFixed(2) || 0}</td>
                    <td>{trade.baseAsset?.toFixed(4) || 0}</td>
                    <td>${((trade.position || 0) * (trade.price || 0)).toLocaleString()}</td>
                    <td>${trade.balance?.toLocaleString() || 0}</td>
                    <td>${trade.totalValue?.toLocaleString() || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}