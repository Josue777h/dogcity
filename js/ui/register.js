import { registerBusiness } from '../supabase.js';
import { showToast } from './toast.js';

/**
 * Módulo de Registro (Onboarding) de CAMLY
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const businessName = document.getElementById('businessName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const phone = document.getElementById('businessPhone').value.trim();

        if (!businessName || !email || !password || !phone) {
            showToast('Por favor completa todos los campos.', 'warning');
            return;
        }

        // UI State: Loading
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<strong>CREANDO TU TIENDA...</strong><span>Estamos preparando todo para ti 🍳</span>';

        try {
            const { user, negocio } = await registerBusiness({
                email,
                password,
                businessName,
                phone
            });

            showToast('✅ ¡Cuenta creada exitosamente!', 'success');
            
            setTimeout(() => {
                window.location.href = `admin.html?negocio=${negocio.nombre}`;
            }, 1500);

        } catch (error) {
            console.error('Error detallado en registro:', error);
            
            let userFriendlyMsg = 'Ocurrió un error inesperado.';
            
            if (error.status === 429 || error.message?.includes('49 seconds')) {
                userFriendlyMsg = '⚠️ Por seguridad, espera un minuto antes de intentar otro registro.';
            } else if (error.message?.includes('User already registered')) {
                userFriendlyMsg = '📧 Este correo ya está registrado. Intenta iniciar sesión.';
            } else if (error.status === 400) {
                userFriendlyMsg = '❌ Datos inválidos. Verifica que la contraseña sea segura y el formulario esté correcto.';
            } else {
                userFriendlyMsg = `Error: ${error.message}`;
            }

            showToast(userFriendlyMsg, 'error');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
