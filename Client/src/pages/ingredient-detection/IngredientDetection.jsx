import { useRef, useState } from 'react';
import './IngredientDetection.css';

export default function IngredientDetection() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [detections, setDetections] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const ingredientNamesVN = {
    'Mushroom': 'Nấm',
    'Egg': 'Trứng',
    'Sweet Potato -Suthuni-': 'Khoai lang',
    'Taro Leaves -Karkalo-': 'Lá khoai môn',
    'Beetroot': 'Củ dền',
    'Potato': 'Khoai tây',
    'Capsicum': 'Ớt chuông',
    'Taro Root-Pidalu-': 'Củ khoai môn',
    'Turnip': 'Củ cải trắng',
    'Green Mint -Pudina-': 'Bạc hà',
    'Pointed Gourd -Chuche Karela-': 'Khổ qua nhỏ',
    'Stinging Nettle -Sisnu-': 'Cây tầm ma',
    'Bitter Gourd': 'Khổ qua',
    'Snake Gourd -Chichindo-': 'Bầu rắn',
    'Fiddlehead Ferns -Niguro-': 'Rau dớn',
    'Palungo -Nepali Spinach-': 'Rau bina',
    'Cabbage': 'Bắp cải',
    'Brinjal': 'Cà tím',
    'Bottle Gourd -Lauka-': 'Bầu',
    'Tomato': 'Cà chua',
    'Onion': 'Hành tây',
    'Radish': 'Củ cải',
    'Sponge Gourd -Ghiraula-': 'Mướp',
    'Red Lentils': 'Đậu lăng đỏ',
    'Masyaura': 'Masyaura',
    'Okra -Bhindi-': 'Đậu bắp',
    'Chayote-iskus-': 'Su su',
    'Garden Peas': 'Đậu Hà Lan',
    'Cheese': 'Phô mai',
    'Rayo ko Saag': 'Cải Rayo',
    'Lapsi -Nepali Hog Plum-': 'Quả Lapsi',
    'Artichoke': 'Atisô',
    'Banana': 'Chuối',
    'Cinnamon': 'Quế',
    'Bread': 'Bánh mì',
    'Jack Fruit': 'Mít',
    'Beans': 'Đậu que',
    'Asparagus -Kurilo-': 'Măng tây',
    'Gundruk': 'Gundruk',
    'Avocado': 'Bơ',
    'Nutrela -Soya Chunks-': 'Đậu nành khô',
    'Rice -Chamal-': 'Gạo',
    'Corn': 'Bắp',
    'Onion Leaves': 'Hành lá',
    'Tree Tomato -Rukh Tamatar-': 'Cà chua thân gỗ',
    'Carrot': 'Cà rốt',
    'Farsi ko Munta': 'Ngọn bí',
    'Coriander -Dhaniya-': 'Rau mùi',
    'Lemon -Nimbu-': 'Chanh',
    'Cassava -Ghar Tarul-': 'Khoai mì',
    'Pork': 'Thịt heo',
    'Cucumber': 'Dưa leo',
    'Black Lentils': 'Đậu lăng đen',
    'Ash Gourd -Kubhindo-': 'Bí đao'
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(URL.createObjectURL(file));
    setCameraOpen(false);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
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
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền camera.');
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    setImage(canvas.toDataURL('image/jpeg', 0.9));

    stopCamera();
    setCameraOpen(false);
  };

  const retakePhoto = () => {
    setImage(null);
    startCamera();
  };

  const analyzeImage = async () => {
    if (!image) return;

    try {
      setAnalyzing(true);

      const formData = new FormData();

      const response = await fetch(image);
      const blob = await response.blob();

      formData.append('image', blob, 'ingredient.jpg');

      const aiResponse = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData,
      });

      if (!aiResponse.ok) {
        throw new Error(`AI server error: ${aiResponse.status}`);
      }

      const result = await aiResponse.json();

      console.log('AI RESULT:', result);

      if (!result.success) {
        throw new Error(result.message || 'AI nhận diện thất bại');
      }

      setDetections(result.detections || []);

    } catch (error) {
      console.error('Không thể phân tích ảnh:', error);
      alert('Không thể kết nối tới AI server.');
    } finally {
      setAnalyzing(false);
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
            >
              Chụp lại
            </button>

            <button
              className="primary-btn"
              onClick={analyzeImage}
              disabled={analyzing}
            >
              {analyzing ? '⏳ Đang phân tích...' : '🔍 Phân tích ảnh'}
            </button>

          </div>
            {detections.length > 0 && (
              <div className="detection-result">
                <h2>Nguyên liệu được nhận diện</h2>

                <div className="detection-list">
                  {Object.entries(
                    detections.reduce((counts, item) => {
                      counts[item.name] = (counts[item.name] || 0) + 1;
                      return counts;
                    }, {})
                  ).map(([name, count]) => (
                    <div className="detection-item" key={name}>
                      <span className="detection-name">
                        {ingredientNamesVN[name] || name}
                      </span>

                      <span className="detection-count">
                        × {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

    </div>
  );
}