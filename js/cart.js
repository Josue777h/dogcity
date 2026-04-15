import { 
  CART_STORAGE_KEY, 
  CUSTOMER_STORAGE_KEY, 
  PRODUCT_NOTES_STORAGE_KEY, 
  ORDER_COMMENT_STORAGE_KEY 
} from './constants.js';

export function saveCart(quantities) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantities));
}

export function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

export function saveCustomerInfo(info) {
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(info));
}

export function loadCustomerInfo() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

export function saveOrderComment(comment) {
  localStorage.setItem(ORDER_COMMENT_STORAGE_KEY, (comment || '').trim());
}

export function loadOrderComment() {
  return localStorage.getItem(ORDER_COMMENT_STORAGE_KEY) || '';
}

export function saveProductNotes(notes) {
  localStorage.setItem(PRODUCT_NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function loadProductNotes() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCT_NOTES_STORAGE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

export function getDeliveryDrivers() {
  try {
    return JSON.parse(localStorage.getItem('dog-city-drivers') || '[]');
  } catch (e) {
    return [];
  }
}

export function saveDeliveryDrivers(drivers) {
  localStorage.setItem('dog-city-drivers', JSON.stringify(drivers));
}

// Deprecated: used for single driver number
export function getDeliveryManNumber() {
  return localStorage.getItem('dog-city-delivery-number') || '';
}

export function setDeliveryManNumber(number) {
  localStorage.setItem('dog-city-delivery-number', number);
}
