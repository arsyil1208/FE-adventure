import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook untuk pakai Bootstrap Modal secara programatik di React.
 * Mengembalikan: { modalRef, showModal, hideModal }
 */
export default function useBootstrapModal() {
  const modalRef = useRef(null);
  const bsInstance = useRef(null);

  // Inisialisasi instance saat elemen modal sudah di-mount
  const initModal = useCallback(() => {
    if (modalRef.current && window.bootstrap && !bsInstance.current) {
      bsInstance.current = new window.bootstrap.Modal(modalRef.current, {
        backdrop: true,
        keyboard: true,
      });
    }
  }, []);

  useEffect(() => {
    // Coba init segera
    initModal();

    // Jika bootstrap belum ada (jarang terjadi), coba lagi setelah delay kecil
    if (!bsInstance.current) {
      const timer = setTimeout(initModal, 200);
      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup saat komponen unmount
      if (bsInstance.current) {
        bsInstance.current.dispose();
        bsInstance.current = null;
      }
    };
  }, [initModal]);

  const showModal = useCallback(() => {
    initModal(); // pastikan sudah init
    bsInstance.current?.show();
  }, [initModal]);

  const hideModal = useCallback(() => {
    bsInstance.current?.hide();
  }, []);

  return { modalRef, showModal, hideModal };
}
