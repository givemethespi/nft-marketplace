import Navbar from '@ui/navbar';
import { FunctionComponent } from 'react';

interface IProps {
    children?: React.ReactNode;
}

const BaseLayout: FunctionComponent<IProps> = ({ children }) => {
    return (
        <>
            <Navbar />
            <div className='py-16 bg-gray-50 overflow-hidden min-h-screen'>
                <div className='max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8'>
                    {children}
                </div>
            </div>
        </>
    );
};

export default BaseLayout;
