import React, { useState } from 'react';
import axios from 'axios';

export const Form = () => {
    const [prospectData, setProspectData] = useState({});
    const [currentKey, setCurrentKey] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [emailResponse, setEmailResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddField = () => {
        if (currentKey && currentValue) {
            setProspectData({ ...prospectData, [currentKey]: currentValue });
            setCurrentKey('');
            setCurrentValue('');
        }
    };

    const handleRemoveField = (keyToRemove: string) => {
        const updatedData: any = { ...prospectData };
        delete updatedData[keyToRemove];
        setProspectData(updatedData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/generate-email', {
                prospectData,
                offerDescription
            });
            
            setEmailResponse(response.data.email);
        } catch (error) {
            console.error('Error:', error);
            setEmailResponse('Failed to generate email.');
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl text-darkText mb-4">Generate Sales Email</h2>
            <div className="w-full max-w-lg">
                <p className="mb-4 text-darkText">
                    This is a demo sales email generator intended to show off Hegel AI's monitoring and online evaluation features. 
                    You can enter a few key/value pairs describing your prospect, and a text description of your offer, 
                    and the AI will synthesize a sales email based on that information. 
                    This is for demonstration purposes only. 
                    To try Hegel AI's monitoring yourself, sign up at{' '}
                    <a href="https://app.hegel-ai.com" className="text-primary hover:text-hover underline">
                        https://app.hegel-ai.com
                    </a>
                </p>
                <form onSubmit={handleSubmit}>
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
                                    className="px-2 py-1 text-xs text-white bg-[#EB8F4C] rounded hover:bg-[#3E3E3F] focus:outline-none"
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
                    <div className="mt-4 w-full max-w-lg p-4 text-lightText bg-primary rounded">
                        <p>{emailResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
