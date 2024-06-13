import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Toasts() {
    return (
        <ToastContainer
            className={'text-base'}
            position='top-right'
            autoClose={5000}
            limit={5}
            hideProgressBar={false}
            closeOnClick
            draggable
            pauseOnFocusLoss={false}
            pauseOnHover
            theme='light'
            transition={Bounce}
        />
    );
}
