import { ChangeEvent } from 'react';
import styled from 'styled-components';
import uuidv4 from 'uuid/v4';
import { Theme } from '@components/ThemeProvider';

const Label = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  color: ${(props: Theme) => props.theme.uploadForm.editForm.text};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledInput = styled.input.attrs({ type: 'text' })`
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  background: ${(props: Theme) => props.theme.uploadForm.editForm.input.background};
  color: ${(props: Theme) => props.theme.uploadForm.editForm.input.text};
  border: 1px solid ${(props: Theme) => props.theme.uploadForm.editForm.input.border.inactive};
  border-radius: 0;
  outline: 0;
  transition: all ${(props: Theme) => props.theme.transition};

  &:focus {
    border-color: ${(props: Theme) => props.theme.uploadForm.editForm.input.border.active};
  }
`;

interface InputProps {
  title: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ title, onChange }: InputProps) => {
  const uuid = uuidv4();

  return (
    <Label htmlFor={uuid}>
      <span>{title}</span>
      <StyledInput id={uuid} type="text" onChange={onChange} />
    </Label>
  );
};

export default Input;