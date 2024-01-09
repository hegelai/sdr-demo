import React, { useState } from 'react';
import axios from 'axios';

export const Form = () => {
    const [prospectData, setProspectData] = useState({});
    const [currentKey, setCurrentKey] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [emailResponse, setEmailResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [logId, setLogId] = useState('');

    const handleAddField = () => {
        if (currentKey && currentValue) {
            setProspectData({ ...prospectData, [currentKey]: currentValue });
            setCurrentKey('');
            setCurrentValue('');
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(emailResponse);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleRemoveField = (keyToRemove: string) => {
        const updatedData: any = { ...prospectData };
        delete updatedData[keyToRemove];
        setProspectData(updatedData);
    };

    const handleFeedback = async (feedback: any) => {
        if (!logId) {
            console.error('Log ID is not set. Cannot send feedback.');
            return;
        }
        try {
            await axios.post('http://127.0.0.1:5000/feedback', {
                log_id: logId,
                feedback: feedback
            });
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/generate-email', {
                prospectData,
                offerDescription
            });
            setEmailResponse(response.data.email);
            setLogId(response.data.log_id)
        } catch (error) {
            console.error('Error:', error);
            setEmailResponse('Failed to generate email.');
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl text-darkText mb-4">Generate Sales Email</h2>
            <p className="mb-4 text-darkText max-w-lg">
                This is a demo sales email generator intended to show off Hegel AI's monitoring and online evaluation features.
                You can enter a few key/value pairs describing your prospect, and a text description of your offer,
                and the AI will synthesize a sales email based on that information.
                This is for demonstration purposes only.
                To try Hegel AI's monitoring yourself, sign up at{' '}
                <a href="https://app.hegel-ai.com" className="text-primary hover:text-hover underline">
                    https://app.hegel-ai.com
                </a>
            </p>
            <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            className="flex-grow p-2 text-darkText bg-white border-2 border-primary rounded focus:outline-none"
                            placeholder="Key"
                            value={currentKey}
                            onChange={(e) => setCurrentKey(e.target.value)}
                        />
                        <input
                            type="text"
                            className="flex-grow p-2 text-darkText bg-white border-2 border-primary rounded focus:outline-none"
                            placeholder="Value"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddField}
                            className="px-4 py-2 text-white bg-primary rounded hover:bg-hover focus:outline-none"
                        >
                            Add
                        </button>
                    </div>
                    {Object.entries(prospectData).map(([key, value]: any[]) => (
                        <div key={key} className="flex justify-between items-center text-sm text-darkText mb-2">
                            <span>{key}: {value}</span>
                            <button
                                onClick={() => handleRemoveField(key)}
                                className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mb-4">
                    <textarea
                        className="w-full p-2 text-darkText bg-white border-2 border-primary rounded focus:outline-none focus:border-hover"
                        placeholder="Enter Offer Description"
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-hover focus:outline-none"
                >
                    {isLoading ? 'Generating...' : 'Generate Email'}
                </button>
            </form>
            {emailResponse && (
                <div className="mt-4 w-full max-w-lg">
                    <div className="p-4 text-lightText bg-primary rounded">
                    <p>{emailResponse}</p>
                    <div className='flex justify-end'>
                        <button
                            onClick={handleCopyToClipboard}
                            className="relative text-[#EAE0E5] hover:ring-2 hover:ring-[#EAE0E5] active:ring-1 active:ring-[#EAE0E5] active:text-[#771541] p-2 rounded"
                            title="Copy to Clipboard"
                        >
                            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.9998 4V1C3.9998 0.44772 4.44752 0 4.9998 0H16.9998C17.5521 0 17.9998 0.44772 17.9998 1V15C17.9998 15.5523 17.5521 16 16.9998 16H13.9998V18.9991C13.9998 19.5519 13.5499 20 12.993 20H1.00666C0.45059 20 0 19.5554 0 18.9991L0.00259995 5.00087C0.00269995 4.44811 0.45264 4 1.00942 4H3.9998ZM2.00242 6L2.00019 18H11.9998V6H2.00242ZM5.9998 4H13.9998V14H15.9998V2H5.9998V4Z" fill="currentColor"/>
                            </svg>
                        </button>
                        {showToast && (
                        <div className="absolute bg-opacity-85 bg-[#3E3E3F] text-white px-4 py-2 rounded shadow-lg">
                            Copied to clipboard
                        </div>
                    )}
                    </div>
                    </div>
                    <div className="flex justify-center gap-4 my-4">
                        <button onClick={() => handleFeedback('up')} className="px-8 py-4 rounded-lg bg-[#EAE0E5] text-[#771541] hover:ring-2 hover:ring-[#771541] active:ring-1 active:ring-[#771541] active:text-[#EAE0E5] active:bg-[#771541]">
                            {/* SVG for Thumbs Up */}
                            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.5998 8.00033H20C21.1046 8.00033 22 8.89576 22 10.0003V12.1047C22 12.3659 21.9488 12.6246 21.8494 12.8662L18.755 20.3811C18.6007 20.7558 18.2355 21.0003 17.8303 21.0003H1C0.44772 21.0003 0 20.5526 0 20.0003V10.0003C0 9.44804 0.44772 9.00033 1 9.00033H4.48184C4.80677 9.00033 5.11143 8.84246 5.29881 8.57701L10.7522 0.851355C10.8947 0.649486 11.1633 0.581978 11.3843 0.692483L13.1984 1.59951C14.25 2.12534 14.7931 3.31292 14.5031 4.45235L13.5998 8.00033ZM6 10.5878V19.0003H17.1606L20 12.1047V10.0003H13.5998C12.2951 10.0003 11.3398 8.77128 11.6616 7.50691L12.5649 3.95894C12.6229 3.73105 12.5143 3.49353 12.3039 3.38837L11.6428 3.0578L6.93275 9.73038C6.68285 10.0844 6.36341 10.3746 6 10.5878ZM4 11.0003H2V19.0003H4V11.0003Z" fill="currentColor" />
                            </svg>
                        </button>
                        <button onClick={() => handleFeedback('down')} className="px-8 py-4 rounded-lg bg-[#EAE0E5] text-[#771541] hover:ring-2 hover:ring-[#771541] active:ring-1 active:ring-[#771541] active:text-[#EAE0E5] active:bg-[#771541]">
                            {/* SVG for Thumbs Down */}
                            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.40017 13H2C0.89543 13 0 12.1046 0 11V8.8957C0 8.6344 0.05118 8.3757 0.15064 8.1342L3.24501 0.61925C3.3993 0.24455 3.76447 0 4.16969 0H21C21.5523 0 22 0.44772 22 1V11C22 11.5523 21.5523 12 21 12H17.5182C17.1932 12 16.8886 12.1579 16.7012 12.4233L11.2478 20.149C11.1053 20.3508 10.8367 20.4184 10.6157 20.3078L8.80163 19.4008C7.74998 18.875 7.20687 17.6874 7.49694 16.548L8.40017 13ZM16 10.4125V2H4.83939L2 8.8957V11H8.40017C9.7049 11 10.6602 12.229 10.3384 13.4934L9.4351 17.0414C9.3771 17.2693 9.4857 17.5068 9.6961 17.612L10.3572 17.9425L15.0673 11.27C15.3172 10.9159 15.6366 10.6257 16 10.4125ZM18 10H20V2H18V10Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Form;
