import { useEffect } from 'react';

/**
 * HealthWarningPopup
 * Popup cảnh báo khi người dùng thêm món có Health Score thấp vào nhật ký.
 *
 * 3 trường hợp:
 * 1. allergyBlock = true → chặn hoàn toàn, chỉ nút Đóng
 * 2. score 60–79 → cảnh báo nhẹ, có Huỷ + Vẫn thêm
 * 3. score < 60 → cảnh báo mạnh, có Huỷ + Vẫn thêm
 *
 * Props:
 *   recipe         — object recipe
 *   score          — number (0–100)
 *   reasons        — string[] (lý do giảm điểm)
 *   allergyBlock   — boolean
 *   matchedAllergies — string[]
 *   onCancel       — () => void
 *   onConfirm      — () => void (chỉ có khi không bị block)
 */
export default function HealthWarningPopup({
  recipe,
  score,
  reasons = [],
  allergyBlock = false,
  matchedAllergies = [],
  onCancel,
  onConfirm,
}) {
  // Khóa scroll nền khi popup mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const recipeName = recipe?.title || recipe?.name || 'Món ăn này';
  const isStrong = score < 60;

  // ─── Allergy block ─────────────────────────────────────────────────────
  if (allergyBlock) {
    return (
      <div style={overlayStyle}>
        <div onClick={onCancel} style={backdropStyle} />
        <div style={{ ...modalStyle, maxWidth: 400 }}>
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 44 }}>🚫</span>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#991b1b', textAlign: 'center', marginBottom: 6 }}>
            Không thể thêm món ăn
          </h3>
          <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 16 }}>
            <strong>{recipeName}</strong>
          </p>

          <div style={{
            background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10,
            padding: '12px 14px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600, marginBottom: 6 }}>
              ⚠ Chứa nguyên liệu bạn đã khai báo dị ứng:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {matchedAllergies.map(a => (
                <span key={a} style={{
                  display: 'inline-block', padding: '3px 10px',
                  background: '#fee2e2', color: '#b91c1c',
                  borderRadius: 12, fontSize: 12, fontWeight: 600,
                }}>
                  {a}
                </span>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 20 }}>
            Vui lòng cập nhật thông tin dị ứng trong Hồ sơ sức khoẻ nếu bạn không còn bị dị ứng.
          </p>

          <button
            type="button"
            onClick={onCancel}
            style={{
              width: '100%', padding: '11px', border: 'none', borderRadius: 10,
              background: '#1e293b', color: 'white',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // ─── Score warning (soft or strong) ────────────────────────────────────
  const accentColor = isStrong ? '#dc2626' : '#d97706';
  const bgLight = isStrong ? '#fef2f2' : '#fffbeb';
  const borderColor = isStrong ? '#fca5a5' : '#fcd34d';
  const iconEmoji = isStrong ? '⚠️' : '💡';
  const headerText = isStrong ? 'Món ăn không được khuyến nghị' : 'Cần cân nhắc trước khi thêm';

  return (
    <div style={overlayStyle}>
      <div onClick={onCancel} style={backdropStyle} />
      <div style={{ ...modalStyle, maxWidth: 420 }}>
        {/* Score badge */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{iconEmoji}</span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: accentColor, textAlign: 'center', marginBottom: 4 }}>
          {headerText}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 }}>
          <strong style={{ color: '#1e293b' }}>{recipeName}</strong>
        </p>

        {/* Score chip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 20,
            background: bgLight, border: `1.5px solid ${borderColor}`,
          }}>
            <span style={{ fontSize: 13, color: '#475569' }}>Điểm phù hợp:</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: accentColor }}>{score}</span>
            <span style={{ fontSize: 13, color: '#475569' }}>/100</span>
          </div>
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div style={{
            background: bgLight, border: `1px solid ${borderColor}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: accentColor, marginBottom: 6 }}>
              Lý do:
            </p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {reasons.map((r, idx) => (
                <li key={idx} style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: 10,
              background: 'white', color: '#475569',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = 'white'; }}
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', border: `2px solid ${accentColor}`, borderRadius: 10,
              background: isStrong ? '#fef2f2' : '#fffbeb', color: accentColor,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = bgLight; }}
            onMouseLeave={e => { e.target.style.background = isStrong ? '#fef2f2' : '#fffbeb'; }}
          >
            Vẫn thêm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 10100,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};

const backdropStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  position: 'relative',
  background: 'white',
  borderRadius: 16,
  width: '100%',
  padding: '24px 20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  animation: 'scaleIn 0.2s ease',
};
