import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiExternalLink, FiShoppingBag, FiStar } from 'react-icons/fi';

export default function AffiliateBanner() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateProduct = async () => {
      try {
        const res = await axios.get('http://localhost:5267/api/AffiliateProduct');
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          // Select a random product or the first one
          setProduct(res.data.data[0]);
        } else {
          useMock();
        }
      } catch (error) {
        console.error('Failed to fetch affiliate products, using fallback mock.', error);
        useMock();
      } finally {
        setLoading(false);
      }
    };

    const useMock = () => {
      setProduct({
        name: "Máy Xay Sinh Tố Thông Minh SmartBlend Pro",
        description: "Đối tác tài trợ: Tích hợp công nghệ xay siêu mịn giữ trọn vẹn 100% vitamin. Món quà sức khỏe hoàn hảo cho gia đình bạn.",
        price: 1290000,
        discount: 25,
        imageUrl: "/affiliate_product.png",
        link: "https://example.com/buy",
        partnerName: "KitchenTech VN"
      });
    };

    fetchAffiliateProduct();
  }, []);

  if (loading || !product) return null;

  return (
    <div style={{
      width: '100%',
      margin: '12px 0',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'stretch',
      boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      position: 'relative',
      height: '160px' // explicit height to constrain it
    }}>
      {/* Partner Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#8b5cf6',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        zIndex: 2
      }}>
        <FiStar style={{ fontSize: '0.65rem' }} /> TÀI TRỢ BỞI {product.partnerName?.toUpperCase() || 'ĐỐI TÁC'}
      </div>

      {/* Image Section */}
      <div style={{
        flex: '0 0 25%',
        position: 'relative',
        backgroundColor: '#f1f5f9'
      }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {product.discount > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: '#ef4444',
            color: 'white',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
          }}>
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{
        flex: 1,
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 800, 
          color: '#1e293b', 
          marginBottom: '6px',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {product.name}
        </h3>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.85rem', 
          marginBottom: '12px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              {(product.price / (1 - product.discount/100)).toLocaleString()}đ
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>
              {product.price.toLocaleString()}đ
            </div>
          </div>
          
          <button 
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 10px rgba(139, 92, 246, 0.3)';
            }}
            onClick={() => window.open(product.link, '_blank')}
          >
            <FiShoppingBag style={{ fontSize: '1rem' }} /> Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
