import React, { useState } from 'react';

function FlightTable() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setData(result.text);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {data && (
                <div>
                    <h2>Extracted Data:</h2>
                    <pre>{data}</pre>
                </div>
            )}
        </div>
    );
}

export default FlightTable;
