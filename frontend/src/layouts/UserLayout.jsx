import { Outlet } from 'react-router-dom';
import Header from './../components/layout/Header'
import Footer from '../components/layout/Footer';


export default function UserLayout() {


  return (
    // Thêm class flex để footer luôn nằm dưới đáy nếu nội dung ngắn
    <div className="user-layout-wrapper flex flex-col min-h-screen">
      <Header />

      <main className="user-content-area flex-grow">
        {/* LOGIC QUAN TRỌNG:
            - Nếu có children (được truyền trực tiếp từ AdminRoute hoặc App.js), hiển thị children (Trang 404).
            - Nếu không, hiển thị Outlet (Các route con bình thường).
        */}
     <Outlet />
      </main>
      <Footer />
    </div>
  );
};
