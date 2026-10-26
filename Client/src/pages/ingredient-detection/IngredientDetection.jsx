import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictImage } from '../../services/api';
import { getIngredients } from '../../services/foodService';
import { useAuth } from '../../context/AuthContext';
import {
  INGREDIENT_NAMES_VN,
  getVietnameseLabel,
  matchDetectedToSystemIngredients,
} from '../../utils/ingredientMapping';
import './IngredientDetection.css';

export default function IngredientDetection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [detections, setDetections] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emptyDetection, setEmptyDetection] = useState(false);
  const [systemIngredients, setSystemIngredients] = useState([]);

  useEffect(() => {
    let active = true;
    getIngredients()
      .then((res) => {
        if (active) {
          setSystemIngredients(res.data?.data || []);
        }
      })
      .catch((err) => {
        console.error('Không thể tải danh sách nguyên liệu hệ thống:', err);
      });

    return () => {
      active = false;
      stopCamera();
      clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const clearRedirectTimer = () => {
    clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = null;
    setRedirecting(false);
  };

  const buildDetectionPayload = (rawDetections, sysIngredientsList) => {
    const countsMap = rawDetections.reduce((acc, item) => {
      const rawName = item.name || item.class_name || '';
      if (!rawName) return acc;
      acc[rawName] = (acc[rawName] || 0) + 1;
      return acc;
    }, {});

    const items = Object.entries(countsMap).map(([rawName, count]) => ({
      rawName,
      vnName: getVietnameseLabel(rawName),
      count,
    }));

    const matchedSystem = matchDetectedToSystemIngredients(items, sysIngredientsList);
    const matchedIngredientIds = matchedSystem
      .map((ing) => ing.ingredient_id || ing.Ingredient_id)
      .filter(Boolean);

    return {
      items,
      matchedIngredientIds,
      matchedIngredientNames: matchedSystem.map((ing) => ing.name || ing.Name).filter(Boolean),
      timestamp: Date.now(),
    };
  };

  const goToExploreWithDetections = (rawDetections = detections, sysIngs = systemIngredients) => {
    clearRedirectTimer();
    const payload = buildDetectionPayload(rawDetections, sysIngs);

    try {
      sessionStorage.setItem('smartmeal_detected_ingredients', JSON.stringify(payload));
      if (accountId && payload.matchedIngredientIds.length > 0) {
        localStorage.setItem(`pantry_${accountId}`, JSON.stringify(payload.matchedIngredientIds));
      }
    } catch (e) {
      console.error('Không thể lưu trạng thái nguyên liệu nhận diện:', e);
    }

    navigate('/?tab=discover&fromDetection=1', {
      state: { detectedIngredients: payload },
    });
  };

  const analyzeImage = async (targetImage = image) => {
    if (!targetImage) return;

    clearRedirectTimer();
    setErrorMsg(null);
    setEmptyDetection(false);

    try {
      setAnalyzing(true);

      const formData = new FormData();
      const response = await fetch(targetImage);
      const blob = await response.blob();

      formData.append('image', blob, 'ingredient.jpg');
      const aiResponse = await predictImage(formData);

      if (!aiResponse.ok) {
        throw new Error(`AI server error: ${aiResponse.status}`);
      }

      const result = await aiResponse.json();

      if (!result.success) {
        throw new Error(result.message || 'AI nhận diện thất bại');
      }

      const detectedList = result.detections || [];
      setDetections(detectedList);

      if (detectedList.length === 0) {
        setEmptyDetection(true);
        return;
      }

      // Ensure system ingredients are available before navigating
      let currentSysIngs = systemIngredients;
      if (!currentSysIngs || currentSysIngs.length === 0) {
        try {
          const ingRes = await getIngredients();
          currentSysIngs = ingRes.data?.data || [];
          setSystemIngredients(currentSysIngs);
        } catch (err) {
          console.error('Lỗi tải nguyên liệu khi đồng bộ:', err);
        }
      }

      const payload = buildDetectionPayload(detectedList, currentSysIngs);
      try {
        sessionStorage.setItem('smartmeal_detected_ingredients', JSON.stringify(payload));
        if (accountId && payload.matchedIngredientIds.length > 0) {
          localStorage.setItem(`pantry_${accountId}`, JSON.stringify(payload.matchedIngredientIds));
        }
      } catch (e) {
        console.error('Không thể lưu trạng thái nguyên liệu nhận diện:', e);
      }

      setRedirecting(true);
      redirectTimerRef.current = setTimeout(() => {
        navigate('/?tab=discover&fromDetection=1', {
          state: { detectedIngredients: payload },
        });
      }, 1200);
    } catch (error) {
      console.error('Không thể phân tích ảnh:', error);
      setErrorMsg('Không thể kết nối tới AI server. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearRedirectTimer();
    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);
    setDetections([]);
    setErrorMsg(null);
    setEmptyDetection(false);
    setCameraOpen(false);
    stopCamera();

    // Tự động nhận diện ngay sau khi chọn ảnh
    analyzeImage(objectUrl);
  };

  const startCamera = async () => {
    clearRedirectTimer();
    setErrorMsg(null);
    setEmptyDetection(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Cannot access camera:', error);
      setErrorMsg('Không thể truy cập camera. Vui lòng kiểm tra quyền camera hoặc tải ảnh từ thiết bị.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImage(dataUrl);
    setDetections([]);
    setErrorMsg(null);
    setEmptyDetection(false);

    stopCamera();
    setCameraOpen(false);

    // Tự động nhận diện ngay sau khi chụp xong
    analyzeImage(dataUrl);
  };

  const retakePhoto = () => {
    clearRedirectTimer();
    setImage(null);
    setDetections([]);
    setErrorMsg(null);
    setEmptyDetection(false);
    startCamera();
  };

  const resetSelection = () => {
    clearRedirectTimer();
    setImage(null);
    setDetections([]);
    setErrorMsg(null);
    setEmptyDetection(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="ingredient-detection-page">

      <div className="ingredient-detection-header">
        <h1>Nhận diện nguyên liệu</h1>

        <p>
          Chụp hoặc tải ảnh nguyên liệu để SmartMeal
          nhận diện tự động.
        </p>
      </div>

      {!image && !cameraOpen && (
        <>
          <div className="detection-actions">

            <button
              className="detection-action-btn"
              onClick={startCamera}
            >
              <span className="action-icon">📷</span>

              <span>
                <strong>Chụp ảnh</strong>
                <small>Sử dụng camera</small>
              </span>
            </button>

            <button
              className="detection-action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="action-icon">📁</span>

              <span>
                <strong>Tải ảnh lên</strong>
                <small>Chọn ảnh từ thiết bị</small>
              </span>
            </button>

          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          <div className="shoot-tips">
            <h3>💡 Lưu ý khi chụp ảnh</h3>

            <ul>
              <li>Không để các nguyên liệu chồng lên nhau.</li>
              <li>Đảm bảo khu vực chụp đủ ánh sáng.</li>
              <li>Đặt nguyên liệu nằm trọn trong khung hình.</li>
              <li>Tránh ảnh bị rung hoặc bị mờ.</li>
              <li>Không che khuất nguyên liệu.</li>
            </ul>
          </div>
        </>
      )}

      {cameraOpen && (
        <div className="camera-section">

          <div className="camera-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />

            <div className="camera-guide">
              Đặt nguyên liệu trong khung hình
            </div>
          </div>

          <div className="camera-controls">

            <button
              className="secondary-btn"
              onClick={() => {
                stopCamera();
                setCameraOpen(false);
              }}
            >
              Hủy
            </button>

            <button
              className="capture-btn"
              onClick={capturePhoto}
            >
              ●
            </button>

          </div>

        </div>
      )}

      {image && !cameraOpen && (
        <div className="preview-section">

          <div className="image-preview">
            <img
              src={image}
              alt="Ảnh nguyên liệu"
            />
          </div>

          <div className="preview-actions">

            <button
              className="secondary-btn"
              onClick={retakePhoto}
              disabled={analyzing}
            >
              📷 Chụp lại
            </button>

            <button
              className="secondary-btn"
              onClick={resetSelection}
              disabled={analyzing}
            >
              📁 Chọn ảnh khác
            </button>

            <button
              className="primary-btn"
              onClick={() => analyzeImage(image)}
              disabled={analyzing}
            >
              {analyzing ? '⏳ Đang nhận diện nguyên liệu...' : '🔍 Nhận diện lại'}
            </button>

          </div>

          {errorMsg && (
            <div className="detection-feedback detection-error" role="alert">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {emptyDetection && !analyzing && (
            <div className="detection-feedback detection-warning" role="status">
              <span>
                Không nhận diện được nguyên liệu nào trong ảnh. Vui lòng chụp lại ở nơi đủ sáng hoặc chọn ảnh rõ nét hơn.
              </span>
            </div>
          )}

          {detections.length > 0 && (
            <div className="detection-result">
              <h2>Nguyên liệu được nhận diện</h2>

              <div className="detection-list">
                {Object.entries(
                  detections.reduce((counts, item) => {
                    const rawName = item.name || item.class_name || '';
                    if (rawName) {
                      counts[rawName] = (counts[rawName] || 0) + 1;
                    }
                    return counts;
                  }, {})
                ).map(([name, count]) => (
                  <div className="detection-item" key={name}>
                    <span className="detection-name">
                      {INGREDIENT_NAMES_VN[name] || name}
                    </span>

                    <span className="detection-count">
                      × {count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="detection-explore-cta">
                {redirecting && (
                  <p className="redirect-status-text">
                    ✨ Đã nhận diện xong! Đang chuyển sang trang Khám phá để gợi ý món ăn...
                  </p>
                )}
                <button
                  type="button"
                  className="explore-now-btn"
                  onClick={() => goToExploreWithDetections(detections, systemIngredients)}
                >
                  🍽️ Khám phá món ăn gợi ý ngay
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}