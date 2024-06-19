import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/joy/Table';
import postImage from './api/postImage';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function App() {
  const [dataUri, setDataUri] = useState('');
  const [dataLink, setDataLink] = useState('');
  const [blob, setBlob] = useState(null);
  const [responses, setResponses] = useState(null);
  const [load, setLoad] = useState(true);
  const canvasRef = useRef(null);

  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  const exportData = (file, path) => {
    if (!file) {
      setDataUri('');
      setDataLink('');
      return;
    }

    fileToDataUri(file).then((data) => {
      setDataUri(data);
      setDataLink(path);
      setBlob(file); // Ici nous définissons le blob avec le fichier original
    });
  };

  useEffect(() => {
    if (blob != null) {
      setLoad(true);
      postImage(blob)
        .then((data) => {
          setResponses(data);
          console.log(data);
        })
        .finally(() => {
          setLoad(false);
        });
    }
  }, [blob]);

  useEffect(() => {
    if (responses && dataUri) {
      drawImageWithRectangles();
    }
  }, [responses, dataUri]);

  const drawImageWithRectangles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      responses.forEach((response) => {
        const { box, color } = response;
        if (box && box.length === 4) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
          ctx.fillStyle = color;
          ctx.fillText(`${response.label_name}: ${response.confidence}`, box[0], box[1] - 10);
        } else {
          console.error('Invalid box data:', box);
        }
      });
    };

    image.src = dataUri;
  };

  return (
    <div className="App">
      {dataUri && (
        <>
          {load ? (
            <CircularProgress />
          ) : (
            <>
              <canvas ref={canvasRef}></canvas>
              {/* <p style={{ color: 'white' }}>{dataLink}</p> */}
              <Table aria-label="basic table" style={{ width: '60%' }}>
                <thead>
                  <tr style={{ opacity: 0.5 }}>
                    <th style={{ textAlign: 'center' }}>Nom</th>
                    <th style={{ textAlign: 'center' }}>Précision</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log('in code ', responses)}
                  {responses.map((response, index) => (
                    <tr key={index}>
                      <td style={{ color: response.color }}>{response.label_name}</td>
                      <td style={{ color: response.color }}>{(response.confidence * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}

      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload file
        <VisuallyHiddenInput
          type="file"
          accept="image/png, image/gif, image/jpeg"
          onChange={(e) => exportData(e.target.files[0] || null, e.target.value || null)}
        />
      </Button>
    </div>
  );
}

export default App;
