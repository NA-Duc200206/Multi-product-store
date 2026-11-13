import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ArrowRight, Minimize2, Ticket, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const AIFloatingChat = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your UCONEXT AI Shopping Assistant. How can I assist you with smart tech gadgets, trending apparel, or beauty essentials today?',
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Best noise-canceling headphones",
    "Trending fashion, apparel",
    "Certified skincare, cosmetics",
    "Shipping, VNPAY payments"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.ai.chat(text);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.message,
          products: res.products || [],
          coupons: res.coupons || [],
          time: 'Just now'
        }
      ]);
    } catch (err) {
      console.warn('AI API fallback to local rules:', err.message);
      let aiResponse = "UCONEXT offers a wide catalog of certified authentic items! You can explore the full collection directly in our store with active discounts.";
      let recommendationLink = "/products";

      const lower = text.toLowerCase();
      if (lower.includes('headphone') || lower.includes('audio') || lower.includes('speaker') || lower.includes('tech') || lower.includes('sound')) {
        aiResponse = "I highly recommend the Sony WH-1000XM5 ANC Headphone and Marshall Acton III in our Smart Tech collection. They feature top-tier acoustic fidelity and full manufacturer warranty.";
        recommendationLink = "/products?categoryId=electronics";
      } else if (lower.includes('fashion') || lower.includes('apparel') || lower.includes('blazer') || lower.includes('clothes') || lower.includes('wear')) {
        aiResponse = "Our Fashion collection features minimalist tailored blazers, seasonal outerwear, and timeless wardrobe essentials crafted from premium fabrics.";
        recommendationLink = "/products?categoryId=fashion";
      } else if (lower.includes('cosmetic') || lower.includes('skin') || lower.includes('beauty') || lower.includes('serum')) {
        aiResponse = "Our Beauty collection offers 100% genuine imported products including Dior lip glow, L'Oréal revitalift serums, and dermatological essentials.";
        recommendationLink = "/products?categoryId=cosmetics";
      } else if (lower.includes('ship') || lower.includes('delivery') || lower.includes('payment') || lower.includes('return') || lower.includes('vnpay')) {
        aiResponse = "We offer nationwide express delivery (free on orders over 1,000,000 ₫), secure digital payments via VNPAY QR / cards, and a straightforward 30-day exchange policy.";
        recommendationLink = "/products";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponse,
          link: recommendationLink,
          time: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '999px',
            background: '#2454F4',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(36, 84, 244, 0.4)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={16} />
          </div>
          <span>UCONEXT Assistant</span>
        </motion.button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              height: '520px',
              maxHeight: 'calc(100vh - 100px)',
              background: isDark ? 'rgba(18, 20, 29, 0.98)' : '#ffffff',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              boxShadow: isDark 
                ? '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(36, 84, 244, 0.2)' 
                : '0 20px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(36, 84, 244, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--glass-border)',
              background: isDark ? 'rgba(36, 84, 244, 0.1)' : 'rgba(36, 84, 244, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#2454F4',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    UCONEXT AI
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    Online 24/7
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.sender === 'user' 
                      ? '#2454F4' 
                      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
                  }}>
                    {msg.text}

                    {/* AI Product Recommendation Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.products.map(prod => (
                          <Link
                            key={prod.id || prod._id}
                            to={`/product/${prod.id || prod._id}`}
                            onClick={() => setIsOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px',
                              borderRadius: '10px',
                              background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid var(--glass-border)',
                              textDecoration: 'none',
                              color: 'var(--text-primary)',
                              transition: 'transform 0.15s ease'
                            }}
                          >
                            <img
                              src={prod.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=200'}
                              alt={prod.name}
                              style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: '600' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(prod.price)}
                              </div>
                            </div>
                            <ArrowRight size={13} color="var(--color-primary)" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* AI Voucher highlight */}
                    {msg.coupons && msg.coupons.length > 0 && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Ticket size={14} color="#f59e0b" />
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', fontFamily: 'monospace' }}>
                            {msg.coupons[0].code}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {msg.coupons[0].discountType === 'percentage' ? `${msg.coupons[0].discountValue}% OFF` : `-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(msg.coupons[0].discountValue)}`}
                        </span>
                      </div>
                    )}

                    {msg.link && (
                      <div style={{ marginTop: '10px' }}>
                        <Link
                          to={msg.link}
                          onClick={() => setIsOpen(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#2454F4',
                            fontSize: '12px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(36, 84, 244, 0.15)' : 'rgba(36, 84, 244, 0.08)'
                          }}
                        >
                          <span>View related products</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '10px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2454F4' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2454F4' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2454F4' }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div style={{
              padding: '0 12px 10px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2454F4';
                    e.currentTarget.style.color = '#2454F4';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '8px'
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask UCONEXT Assistant..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#2454F4',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIFloatingChat;
