// app/admin/layout.tsx
import BookingPopupListener from './BookingPopupListener';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BookingPopupListener />
      {children}
    </>
  );
}