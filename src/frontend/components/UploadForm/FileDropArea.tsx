import { useState } from 'react';
import styled from 'styled-components';
import { Theme } from '@components/ThemeProvider';
import FileSelectButton from './FileSelectButton';

type DropAreaProps = Theme<{ isDrop: boolean }>;

const DropArea = styled.div<DropAreaProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 8px;
  padding: 24px;
  border: 2px dashed
    ${(props: DropAreaProps) => (props.isDrop ? props.theme.uploadForm.dropArea : 'transparent')};
  outline: 0;
  transition: border-color ${(props: DropAreaProps) => props.theme.transition};
`;

const Title = styled.h1`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  color: ${(props: Theme) => props.theme.uploadForm.title};
`;

const Note = styled.div`
  margin-top: 24px;
  color: ${(props: Theme) => props.theme.uploadForm.text};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
`;

interface FileDropAreaProps {
  onFileListChange: (files: FileList | null) => void;
}

const FileDropArea = ({ onFileListChange }: FileDropAreaProps) => {
  const [isDrop, setDrop] = useState(false);

  return (
    <DropArea
      isDrop={isDrop}
      onDrop={(event) => {
        event.preventDefault();
        onFileListChange(event.dataTransfer.files);
        setDrop(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDrop(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDrop(false);
      }}
    >
      <Title>Drag and drop your tracks here</Title>
      <FileSelectButton
        accept="audio/mpeg"
        multiple
        onChange={(event) => {
          onFileListChange(event.target.files);
        }}
      >
        or choose files to upload
      </FileSelectButton>
      <Note>
        <p>Note: Your audio file may not exceed 10 MB and has to be in MP3 format.</p>
      </Note>
    </DropArea>
  );
};

export default FileDropArea;
