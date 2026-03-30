import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time, CrosshairMode } from 'lightweight-charts';
import { useI18n } from '../i18n';
import type { Kline, Trade } from './types';
import './TradingViewChart.css';

interface TradingViewChartProps {
  klines: Kline[];
  trades: Trade[];
  equityCurve?: { timestamp: string; equity: number }[];
}

interface CrosshairData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const lightTheme = {
  layout: {
    background: { type: 'solid', color: '#ffffff' },
    textColor: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 12,
  },
  grid: {
    vertLines: { color: 'rgba(0, 0, 0, 0.04)' },
    horzLines: { color: 'rgba(0, 0, 0, 0.04)' },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      color: 'rgba(59, 130, 246, 0.5)',
      width: 1,
      style: 2,
      labelBackgroundColor: '#3b82f6',
    },
    horzLine: {
      color: 'rgba(59, 130, 246, 0.5)',
      width: 1,
      style: 2,
      labelBackgroundColor: '#3b82f6',
    },
  },
  timeScale: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    visible: true,
    timeVisible: true,
    secondsVisible: false,
    tickMarkFormatter: (time: Time) => {
      const date = new Date(time as string);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
  },
  rightPriceScale: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    scaleMargins: {
      top: 0.1,
      bottom: 0.2,
    },
  },
  handleScroll: {
    vertTouchDrag: true,
    horzTouchDrag: true,
    mouseWheel: true,
    pressedMouseMove: true,
  },
  handleScale: {
    axisPressedMouseMove: true,
    mouseWheel: true,
    pinch: true,
  },
};

const darkTheme = {
  layout: {
    background: { type: 'solid', color: '#131722' },
    textColor: '#d1d4dc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 12,
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
    horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      color: 'rgba(59, 130, 246, 0.6)',
      width: 1,
      style: 2,
      labelBackgroundColor: '#3b82f6',
    },
    horzLine: {
      color: 'rgba(59, 130, 246, 0.6)',
      width: 1,
      style: 2,
      labelBackgroundColor: '#3b82f6',
    },
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    visible: true,
    timeVisible: true,
    secondsVisible: false,
    tickMarkFormatter: (time: Time) => {
      const date = new Date(time as string);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    scaleMargins: {
      top: 0.1,
      bottom: 0.2,
    },
  },
  handleScroll: {
    vertTouchDrag: true,
    horzTouchDrag: true,
    mouseWheel: true,
    pressedMouseMove: true,
  },
  handleScale: {
    axisPressedMouseMove: true,
    mouseWheel: true,
    pinch: true,
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
  const { t, language } = useI18n();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const equityContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equityChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);
  const [crosshairData, setCrosshairData] = useState<CrosshairData | null>(null);

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
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    chart.subscribeCrosshairMove((param) => {
      if (param && param.seriesData && param.seriesData.size > 0) {
        const data = param.seriesData.get(candlestickSeries);
        const volumeData = param.seriesData.get(volumeSeries);
        if (data) {
          setCrosshairData({
            time: data.time as string,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: volumeData ? (volumeData as HistogramData).value : undefined,
          });
        }
      } else {
        setCrosshairData(null);
      }
    });

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
        volumeSeriesRef.current = null;
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
      const volumeMap = new Map<string, HistogramData>();
      
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
          volumeMap.set(time, {
            time: time as Time,
            value: k.volume,
            color: k.close >= k.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
          });
        }
      });

      const candleData = Array.from(timeMap.values()).sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
        return timeA - timeB;
      });

      const volumeData = Array.from(volumeMap.values()).sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
        return timeA - timeB;
      });

      candlestickSeriesRef.current.setData(candleData);
      volumeSeriesRef.current?.setData(volumeData);
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
        <span className="chart-title">{t('chart.klineChart')}</span>
        {klines.length > 0 && (
          <span className="chart-info">
            {klines[0]?.open_time?.slice(0, 10)} ~ {klines[klines.length - 1]?.open_time?.slice(0, 10)}
          </span>
        )}
        {crosshairData && (
          <div className="ohl-tooltip">
            <span className="ohl-label o">O</span>
            <span className="ohl-value">{crosshairData.open.toLocaleString()}</span>
            <span className="ohl-label h">H</span>
            <span className="ohl-value">{crosshairData.high.toLocaleString()}</span>
            <span className="ohl-label l">L</span>
            <span className="ohl-value">{crosshairData.low.toLocaleString()}</span>
            <span className="ohl-label c">C</span>
            <span className="ohl-value">{crosshairData.close.toLocaleString()}</span>
            {crosshairData.volume !== undefined && (
              <>
                <span className="ohl-label v">V</span>
                <span className="ohl-value">{crosshairData.volume.toLocaleString()}</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="chart-wrapper" ref={chartContainerRef} />
      <div className="equity-header">
        <span className="chart-title">{t('chart.equityCurve')}</span>
      </div>
      <div className="equity-wrapper" ref={equityContainerRef} />
      <div className="trades-section">
        <h4 className="section-title">{t('chart.tradeRecords')} ({trades?.length || 0})</h4>
        <div className="trades-table-wrapper">
          <table className="trades-table">
            <thead>
              <tr>
                <th>{t('trades.time')}</th>
                <th>{t('trades.type')}</th>
                <th>{t('trades.price')}</th>
                <th>{t('trades.amount')}</th>
                <th>{t('trades.fee')}</th>
                <th>{t('trades.balance')}</th>
                <th>{t('trades.positionValue')}</th>
                <th>{language === 'zh' ? '当前金额' : 'Balance'}</th>
                <th>{t('trades.totalValue')}</th>
              </tr>
            </thead>
            <tbody>
              {!trades || trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-trades">{t('trades.noTrades')}</td>
                </tr>
              ) : (
                [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((trade, index) => (
                  <tr key={index} className={trade.type === 'buy' ? 'trade-buy' : 'trade-sell'}>
                    <td>{trade.timestamp?.slice(0, 16) || '-'}</td>
                    <td>
                      <span className={`trade-type ${trade.type}`}>
                        {trade.type === 'buy' ? t('trades.buy') : t('trades.sell')}
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
