import { AppLayout } from './components/AppLayout';
import { Toaster } from 'react-hot-toast';

export const App = () => {
  return (
    <>
      <AppLayout />
      <Toaster position="top-right" />
    </>
  );
}; 