
import React from 'react';

export const FileDisplay = (props) => {
    //useCallback na bytes
    const ramkaBlob = new Blob([props.bytes], { type: "application/pdf" });
    const ramkaBlobUrl = URL.createObjectURL(ramkaBlob);
    return (
        <iframe src={ramkaBlobUrl}></iframe>
    )
}