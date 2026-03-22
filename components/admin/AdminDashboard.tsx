'use client'
import * as React from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/config/api-base'

interface Stats {
  revenue:       number
  orders:        number
  customers:     number
  lowStock:      number
  pendingOrders: number
  productsLive:  number
}
interface Order {
  id:           string
  customerName: string
  total:        number
  status:       string
  createdAt:    string
}

function fmt(n: number) {
  return `₵${(n / 100).toFixed(2)}`
}
function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('en-GH', {
      month: 'short', day: 'numeric'
    })
  } catch { return '—' }
}
function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase()
  const [bg, color] =
    s === 'pending'                  ? ['var(--adm-gold2)',    'var(--adm-gold)']
    : s === 'completed' ||
      s === 'complete'               ? ['var(--adm-em2)',      'var(--adm-emerald)']
    : s === 'processing' ||
      s === 'review'                 ? ['var(--adm-sk2)',      'var(--adm-sky)']
    :                                  ['var(--adm-s3)',       'var(--adm-t3)']
  return (
    <span style={{
      background: bg, color,
      fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 4
    }}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = React.useState<Stats>({
    revenue: 0, orders: 0, customers: 0,
    lowStock: 0, pendingOrders: 0, productsLive: 0,
  })
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.allSettled([
      fetch(apiUrl('/api/admin/orders'),    { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/admin/customers'), { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/admin/products'),  { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/admin/inventory'), { credentials: 'include' }).then(r => r.json()),
    ]).then(([oR, cR, pR, iR]) => {
      const od = oR.status === 'fulfilled' ? oR.value : {}
      const cd = cR.status === 'fulfilled' ? cR.value : {}
      const pd = pR.status === 'fulfilled' ? pR.value : {}
      const id = iR.status === 'fulfilled' ? iR.value : {}

      const allO = od.data?.orders    ?? od.orders    ?? []
      const allC = cd.data?.customers ?? cd.customers ?? []
      const allP = pd.data?.products  ?? pd.products  ?? []
      const allI = id.data?.variants  ?? id.variants  ?? []

      setStats({
        revenue: allO
          .filter((o: { status: string }) => ['COMPLETED','DELIVERED'].includes(o.status))
          .reduce((s: number, o: { total?: number }) => s + (Number(o.total) || 0), 0),
        orders:       allO.length,
        customers:    allC.length,
        lowStock:     allI.filter((v: { stock?: number; quantity?: number }) => (v.stock ?? v.quantity ?? 0) < 5).length,
        pendingOrders: allO.filter((o: { status: string }) => o.status === 'PENDING').length,
        productsLive: allP.filter((p: { visibleOnStore?: boolean; status?: string }) =>
          p.visibleOnStore || p.status === 'ACTIVE'
        ).length,
      })
      setOrders(allO.slice(0, 6).map((o: {
        id: string
        customer?: { name?: string }
        customerName?: string
        total?: number
        status?: string
        createdAt?: string
      }) => ({
        id:           o.id,
        customerName: o.customer?.name ?? o.customerName ?? 'Guest',
        total:        Number(o.total) || 0,
        status:       o.status ?? 'PENDING',
        createdAt:    o.createdAt ?? '',
      })))
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-GH', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const s: React.CSSProperties = {
    fontFamily: 'var(--font-inter, system-ui, sans-serif)'
  }

  const card: React.CSSProperties = {
    background: 'var(--adm-s1)',
    border: '1px solid var(--adm-b1)',
    borderRadius: 8,
  }

  return (
    <div style={s}>

      {/* Page heading */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', marginBottom: 22
      }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 600,
            color: 'var(--adm-t1)',
            letterSpacing: '-0.02em', margin: 0
          }}>
            Dashboard
          </h1>
          <p style={{
            fontSize: 12, color: 'var(--adm-t3)',
            marginTop: 3
          }}>
            {today} · Store is live
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px', height: 30,
            border: '1px solid var(--adm-b2)',
            borderRadius: 6,
            background: 'var(--adm-s2)',
            color: 'var(--adm-t2)', fontSize: 11, cursor: 'pointer'
          }}>
            <svg style={{ width: 11, height: 11 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Last 30 days
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 10, marginBottom: 16
      }}>

        {[
          {
            label: 'Revenue',
            val: loading ? '—' : fmt(stats.revenue),
            sub: stats.revenue === 0 ? '— No orders yet' : '↑ All time',
            subColor: stats.revenue > 0 ? 'var(--adm-emerald)' : 'var(--adm-t3)',
            iconBg: 'var(--adm-gold2)', iconColor: 'var(--adm-gold)',
            iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
          },
          {
            label: 'Orders',
            val: loading ? '—' : String(stats.orders),
            sub: stats.pendingOrders > 0
              ? `${stats.pendingOrders} pending`
              : '— None yet',
            subColor: stats.pendingOrders > 0 ? 'var(--adm-gold)' : 'var(--adm-t3)',
            iconBg: 'var(--adm-sk2)', iconColor: 'var(--adm-sky)',
            iconPath: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18',
          },
          {
            label: 'Customers',
            val: loading ? '—' : String(stats.customers),
            sub: '— No signups yet',
            subColor: 'var(--adm-t3)',
            iconBg: 'var(--adm-em2)', iconColor: 'var(--adm-emerald)',
            iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
          },
          {
            label: 'Low Stock',
            val: loading ? '—' : String(stats.lowStock),
            sub: stats.lowStock > 0 ? '↓ Needs attention' : '✓ All good',
            subColor: stats.lowStock > 0 ? 'var(--adm-rose)' : 'var(--adm-emerald)',
            iconBg: stats.lowStock > 0 ? 'var(--adm-ro2)' : 'var(--adm-em2)',
            iconColor: stats.lowStock > 0 ? 'var(--adm-rose)' : 'var(--adm-emerald)',
            iconPath: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
            alert: stats.lowStock > 0 ? stats.lowStock : undefined,
          },
        ].map(({ label, val, sub, subColor, iconBg, iconColor, iconPath, alert }) => (
          <div key={label} style={{ ...card, padding: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 10
            }}>
              <span style={{
                fontSize: 9, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--adm-t3)',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                {label}
                {alert != null && (
                  <span style={{
                    background: 'var(--adm-ro2)',
                    color: 'var(--adm-rose)',
                    fontSize: 9, fontWeight: 700,
                    padding: '1px 5px', borderRadius: 3
                  }}>{alert}</span>
                )}
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: iconBg, color: iconColor,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24"
                  fill="none" stroke={iconColor} strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d={iconPath}/>
                </svg>
              </div>
            </div>
            <div style={{
              fontSize: 24, fontWeight: 600,
              color: label === 'Low Stock' && stats.lowStock > 0
                ? 'var(--adm-rose)' : 'var(--adm-t1)',
              letterSpacing: '-0.025em',
              lineHeight: 1, marginBottom: 8
            }}>
              {val}
            </div>
            <div style={{ fontSize: 11, color: subColor }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 10, marginBottom: 16
      }}>

        {/* Sales chart */}
        <div style={card}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '13px 16px',
            borderBottom: '1px solid var(--adm-b1)'
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--adm-t1)'
            }}>
              Sales — last 30 days
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--adm-t3)'
            }}>
              <span style={{
                width: 7, height: 7,
                background: 'var(--adm-gold)',
                borderRadius: 2, display: 'inline-block'
              }}/>
              Revenue
            </span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{
              height: 100,
              border: '1px dashed var(--adm-b2)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11, color: 'var(--adm-t3)'
            }}>
              Revenue data will appear once orders are placed
            </div>
          </div>
        </div>

        {/* Store health */}
        <div style={card}>
          <div style={{
            padding: '13px 16px',
            borderBottom: '1px solid var(--adm-b1)',
            fontSize: 12, fontWeight: 600,
            color: 'var(--adm-t1)'
          }}>
            Store health
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: 10, marginBottom: 14
            }}>
              {[
                { k: 'Products live',  v: stats.productsLive, dot: 'var(--adm-emerald)', vc: 'var(--adm-t1)' },
                { k: 'Pending orders', v: stats.pendingOrders,dot: 'var(--adm-gold)',    vc: stats.pendingOrders > 0 ? 'var(--adm-gold)' : 'var(--adm-t1)' },
                { k: 'Low stock',      v: stats.lowStock,     dot: 'var(--adm-rose)',    vc: stats.lowStock > 0 ? 'var(--adm-rose)' : 'var(--adm-t1)' },
                { k: 'Customers',      v: stats.customers,    dot: 'var(--adm-sky)',     vc: 'var(--adm-t1)' },
              ].map(({ k, v, dot, vc }) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: 11, color: 'var(--adm-t2)',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: dot, display: 'inline-block'
                    }}/>
                    {k}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: vc
                  }}>
                    {loading ? '—' : v}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: '1px solid var(--adm-b1)',
              paddingTop: 12
            }}>
              <div style={{
                fontSize: 9, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--adm-t3)', marginBottom: 8
              }}>
                Quick actions
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 6
              }}>
                {[
                  { label: 'Add Product', href: '/admin/products/new', c: 'var(--adm-gold)' },
                  { label: 'Orders',      href: '/admin/orders',       c: 'var(--adm-sky)'  },
                  { label: 'Inventory',   href: '/admin/inventory',    c: 'var(--adm-rose)' },
                  { label: 'Customers',   href: '/admin/customers',    c: 'var(--adm-emerald)' },
                ].map(({ label, href, c }) => (
                  <Link key={href} href={href} style={{
                    background: 'var(--adm-s2)',
                    border: '1px solid var(--adm-b1)',
                    borderRadius: 6, padding: '8px 10px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 500,
                    color: 'var(--adm-t1)',
                    textDecoration: 'none',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: c, flexShrink: 0
                    }}/>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '13px 16px',
          borderBottom: '1px solid var(--adm-b1)'
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: 'var(--adm-t1)'
          }}>
            Recent orders
          </span>
          <Link href="/admin/orders" style={{
            fontSize: 11, color: 'var(--adm-gold)',
            textDecoration: 'none'
          }}>
            View all →
          </Link>
        </div>

        {/* Table head */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,.9fr) minmax(0,.7fr)',
          gap: 12, padding: '9px 16px',
          background: 'var(--adm-s2)',
          borderBottom: '1px solid var(--adm-b1)'
        }}>
          {['Order','Customer','Total','Status','Date'].map(h => (
            <span key={h} style={{
              fontSize: 9, fontWeight: 600,
              letterSpacing: '0.09em', textTransform: 'uppercase',
              color: 'var(--adm-t3)'
            }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            fontSize: 12, color: 'var(--adm-t3)'
          }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{
            padding: '36px 16px', textAlign: 'center',
            fontSize: 12, color: 'var(--adm-t3)'
          }}>
            Orders will appear here once customers place them.
          </div>
        ) : orders.map((o, i) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,.9fr) minmax(0,.7fr)',
              gap: 12, padding: '10px 16px',
              borderBottom: i < orders.length - 1
                ? '1px solid var(--adm-b1)' : 'none',
              textDecoration: 'none',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLElement).style.background =
                'rgba(255,255,255,0.02)')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLElement).style.background = 'transparent')
            }
          >
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: 'var(--adm-t1)', display: 'flex', alignItems: 'center'
            }}>
              #{o.id.slice(-6).toUpperCase()}
            </span>
            <span style={{
              fontSize: 12, color: 'var(--adm-t2)',
              display: 'flex', alignItems: 'center'
            }}>
              {o.customerName}
            </span>
            <span style={{
              fontSize: 12, color: 'var(--adm-t2)',
              display: 'flex', alignItems: 'center'
            }}>
              {fmt(o.total)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <StatusPill status={o.status} />
            </span>
            <span style={{
              fontSize: 11, color: 'var(--adm-t3)',
              display: 'flex', alignItems: 'center'
            }}>
              {fmtDate(o.createdAt)}
            </span>
          </Link>
        ))}
      </div>

    </div>
  )
}
