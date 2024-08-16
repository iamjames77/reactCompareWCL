import React, { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

const IconColor = ({ src }) => {
    const [color, setColor] = useState(null);

    useEffect(() => {
        const fetchAndUpdateJson = async () => {
            try {
                // JSON 파일을 fetch로 가져오기
                const response = await fetch('frontend/src/IconColorJSON.json');
                const jsonFile = await response.json();

                // JSON에서 색상 값을 찾음
                if (jsonFile[src]) {
                    setColor(jsonFile[src]);
                } else {
                    // JSON에 값이 없으면 새로 계산하여 추가
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = `https://wow.zamimg.com/images/wow/icons/large/${src}`;

                    img.onload = async () => {
                        const colorThief = new ColorThief();
                        const dominantColor = colorThief.getColor(img);
                        const rgbColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

                        setColor(rgbColor);

                        // JSON 파일을 업데이트
                        const updatedJson = { ...jsonFile, [src]: rgbColor };

                        // 업데이트된 JSON 파일을 서버에 다시 저장
                        await fetch('frontend/src/IconColorJSON.json', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updatedJson),
                        });
                    };
                }
            } catch (error) {
                console.error('Error fetching or updating JSON:', error);
            }
        };

        fetchAndUpdateJson();
    }, [src]);

    return color;
};

export default IconColor;
