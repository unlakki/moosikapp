import { Theme } from '@components/ThemeProvider';
import Link from 'next/link';
import styled from 'styled-components';

const StyledLink = styled.a`
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  color: ${(props: Theme) => props.theme.forms.link.inactive};
  text-decoration: none;
  cursor: pointer;
  text-shadow: ${(props: Theme) => props.theme.shadow.long};
  transition: color ${(props: Theme) => props.theme.transition};

  &:hover {
    color: ${(props: Theme) => props.theme.forms.link.active};
  }
`;

interface FormLinkProps {
  children: string;
  to: string;
}

const FormLink = ({ to, children }: FormLinkProps) => (
  <Link href={to}>
    <StyledLink>{children}</StyledLink>
  </Link>
);

export default FormLink;
