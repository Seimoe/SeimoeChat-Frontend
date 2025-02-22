import {useEffect, useState} from 'react';

const useKeyboard = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleFocus = () => setKeyboardVisible(true);
        const handleBlur = () => setKeyboardVisible(false);

        document.addEventListener('focus', handleFocus, true);
        document.addEventListener('blur', handleBlur, true);

        return () => {
            document.removeEventListener('focus', handleFocus, true);
            document.removeEventListener('blur', handleBlur, true);
        };
    }, []);

    return isKeyboardVisible;
};

export default useKeyboard; 