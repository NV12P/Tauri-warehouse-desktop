import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessage } from '../../services/apiClient';
import { LoadingState } from '../../components/ui/LoadingState';
import { stockInChartService } from './stockInChartService';
import type { StockInChartPeriod, StockInChartPoint } from './types';
import './stock-in-chart.css';

const CHART_HEIGHT = 190;
const PADDING = { top: 14, right: 14, bottom: 28, left: 42 };

interface StockInChartProps {
  /** Berubah saat tombol Refresh dashboard ditekan. */
  refreshToken?: number;
}

function niceCeiling(value: number): number {
  if (value <= 10) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / (magnitude / 2)) * (magnitude / 2);
}

function formatValue(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
}

export function StockInChart({ refreshToken = 0 }: StockInChartProps) {
  const [period, setPeriod] = useState<StockInChartPeriod>('week');
  const [points, setPoints] = useState<StockInChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [width, setWidth] = useState(640);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setPoints(await stockInChartService.getStockInSeries(period));
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Gagal memuat grafik barang masuk.'));
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (nextWidth && nextWidth > 0) setWidth(nextWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    const plotWidth = Math.max(width - PADDING.left - PADDING.right, 1);
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const highest = points.reduce((max, point) => Math.max(max, point.quantity), 0);
    const axisMax = niceCeiling(highest);

    return {
      plotWidth,
      plotHeight,
      axisMax,
      x: (index: number) =>
        points.length <= 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (points.length - 1)) * plotWidth,
      y: (value: number) => PADDING.top + plotHeight - (value / axisMax) * plotHeight,
    };
  }, [points, width]);

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${geometry.x(index)} ${geometry.y(point.quantity)}`)
    .join(' ');
  const baseline = CHART_HEIGHT - PADDING.bottom;
  const areaPath = points.length
    ? `${linePath} L ${geometry.x(points.length - 1)} ${baseline} L ${geometry.x(0)} ${baseline} Z`
    : '';

  const periodLabel = period === 'week' ? '7 hari terakhir' : '30 hari terakhir';

  return (
    <section className="chart-card" aria-label="Grafik barang masuk">
      <div className="chart-header">
        <div className="chart-heading">
          <div className="chart-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 17 9 11 13 15 21 6" />
              <path d="M21 11V6h-5" />
            </svg>
            Barang Masuk
          </div>
          <p className="chart-subtitle">
            {periodLabel} &middot; total unit material yang diterima gudang
          </p>
        </div>

        <div className="chart-period" role="group" aria-label="Pilih periode grafik">
          <button
            type="button"
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
            disabled={isLoading}
          >
            1 Minggu
          </button>
          <button
            type="button"
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
            disabled={isLoading}
          >
            1 Bulan
          </button>
        </div>
      </div>

      <div className="chart-body" ref={containerRef}>
        {isLoading ? (
          <LoadingState message="Memuat grafik barang masuk..." compact />
        ) : errorMessage ? (
          <div className="chart-error">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => void load()}>
              Coba Lagi
            </button>
          </div>
        ) : points.length === 0 ? (
          <div className="chart-empty">Belum ada data barang masuk pada periode ini.</div>
        ) : (
          <svg
            className="chart-svg"
            width={width}
            height={CHART_HEIGHT}
            viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`Grafik barang masuk ${periodLabel}`}
          >
            <defs>
              <linearGradient id="stockInArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((ratio) => {
              const value = geometry.axisMax * ratio;
              const y = geometry.y(value);
              return (
                <g key={ratio}>
                  <line
                    className="chart-grid-line"
                    x1={PADDING.left}
                    y1={y}
                    x2={width - PADDING.right}
                    y2={y}
                  />
                  <text className="chart-axis-label" x={PADDING.left - 8} y={y + 3} textAnchor="end">
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}

            <path className="chart-area" d={areaPath} fill="url(#stockInArea)" />
            <path className="chart-line" d={linePath} />

            {points.map((point, index) => {
              const showDetail = points.length <= 10 || index % 5 === 0 || index === points.length - 1;
              const tooltip = `${point.fullLabel}: ${formatValue(point.quantity)} unit`;
              return (
                <g key={point.date}>
                  <circle cx={geometry.x(index)} cy={geometry.y(point.quantity)} r={10} fill="transparent">
                    <title>{tooltip}</title>
                  </circle>
                  {showDetail && (
                    <circle
                      className="chart-point"
                      cx={geometry.x(index)}
                      cy={geometry.y(point.quantity)}
                      r={3}
                    />
                  )}
                  {showDetail && (
                    <text
                      className="chart-axis-label"
                      x={geometry.x(index)}
                      y={CHART_HEIGHT - 8}
                      textAnchor="middle"
                    >
                      {point.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </section>
  );
}
