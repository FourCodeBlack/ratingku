// ========================================
// MSG ALERT SYSTEM
// ========================================

const msgBox = (() => {
  let container = null;
  let styleInjected = false;
  
  // Inject CSS styles
  const injectStyles = () => {
    if (styleInjected) return;
    
    const style = document.createElement('style');
    style.textContent = `
      .msg-alert-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        pointer-events: none;
      }
      
      .msg-alert {
        min-width: 300px;
        max-width: 500px;
        padding: 16px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
        font-size: 14px;
        color: white;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
        pointer-events: auto;
        position: relative;
        padding-left: 45px;
      }
      
      .msg-alert::before {
        content: '';
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
      }
      
      .msg-alert.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .msg-alert-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      
      .msg-alert-success::before {
        content: '✓';
        background: white;
        border-radius: 50%;
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }
      
      .msg-alert-error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      }
      
      .msg-alert-error::before {
        content: '✕';
        background: white;
        border-radius: 50%;
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }
      
      .msg-alert-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }
      
      .msg-alert-warning::before {
        content: '⚠';
        color: white;
        font-size: 18px;
      }
      
      .msg-alert-info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      
      .msg-alert-info::before {
        content: 'ℹ';
        background: white;
        border-radius: 50%;
        color: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }
      
      /* Mobile responsive */
      @media (max-width: 640px) {
        .msg-alert-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }
        
        .msg-alert {
          min-width: auto;
          width: 100%;
        }
      }
    `;
    
    document.head.appendChild(style);
    styleInjected = true;
  };
  
  const init = () => {
    if (!container) {
      injectStyles();
      container = document.createElement('div');
      container.className = 'msg-alert-container';
      document.body.appendChild(container);
    }
  };
  
  const show = (message, type = 'info', duration = 3000) => {
    init();
    
    const alert = document.createElement('div');
    alert.className = `msg-alert msg-alert-${type}`;
    alert.textContent = message;
    
    container.appendChild(alert);
    
    // Trigger animation
    setTimeout(() => alert.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 300);
    }, duration);
  };
  
  return {
    show,
    success: (msg, duration = 3000) => show(msg, 'success', duration),
    error: (msg, duration = 3000) => show(msg, 'error', duration),
    warning: (msg, duration = 3000) => show(msg, 'warning', duration),
    info: (msg, duration = 3000) => show(msg, 'info', duration)
  };
})();

// Export untuk berbagai sistem module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = msgBox;
}

if (typeof define === 'function' && define.amd) {
  define([], () => msgBox);
}

if (typeof window !== 'undefined') {
  window.msgBox = msgBox;
}

export default msgBox;