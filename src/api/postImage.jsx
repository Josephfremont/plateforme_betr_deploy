const postImage = async (blobImage) => {
    const formData = new FormData();
    formData.append('blobImage', blobImage);

    return fetch('http://127.0.0.1:5000/BetrDetectImage', {
        // method: 'GET',
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error(error);
        });
};

export default postImage;
