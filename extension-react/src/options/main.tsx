import { createRoot } from 'react-dom/client';
import OptionsContainer from '../components/OptionsContainer';
import '../styles/options.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsContainer />);
} else {
  console.error('Root container not found');
}