import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Response Interceptor for Error Handling & Risk Rejections
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || 'Gateway communication error';
    console.error('[API Error]:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

/**
 * Submits an order request to Spring Boot gateway -> LMAX Disruptor
 * @param {Object} orderData - { symbol, price, quantity, isBuy, isLimitOrder }
 */
export const sendOrderToGateway = async (orderData) => {
  return await api.post('/orders', orderData);
};

export default api;