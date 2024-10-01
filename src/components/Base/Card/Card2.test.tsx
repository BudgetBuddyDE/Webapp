import {render} from '@testing-library/react';

import Card2 from './Card2.component';

describe('Card2', () => {
  it('renders Card2 component with children', () => {
    const {getByText} = render(<Card2>Test Content</Card2>);
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Card2.Header with actions', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Header actions={<button>Action</button>}>Header Content</Card2.Header>
      </Card2>,
    );
    expect(getByText('Header Content')).toBeInTheDocument();
    expect(getByText('Action')).toBeInTheDocument();
  });

  it('renders Card2.Title', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Title>Title Content</Card2.Title>
      </Card2>,
    );
    expect(getByText('Title Content')).toBeInTheDocument();
  });

  it('renders Card2.Subtitle', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Subtitle>Subtitle Content</Card2.Subtitle>
      </Card2>,
    );
    expect(getByText('Subtitle Content')).toBeInTheDocument();
  });

  it('renders Card2.Action as Button', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Action>Button Action</Card2.Action>
      </Card2>,
    );
    expect(getByText('Button Action')).toBeInTheDocument();
  });

  it('renders Card2.Action as IconButton', () => {
    const {getByRole} = render(
      <Card2>
        <Card2.Action useIconButton>IconButton Action</Card2.Action>
      </Card2>,
    );
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('renders Card2.Body', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Body>Body Content</Card2.Body>
      </Card2>,
    );
    expect(getByText('Body Content')).toBeInTheDocument();
  });

  it('renders Card2.Footer', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Footer>Footer Content</Card2.Footer>
      </Card2>,
    );
    expect(getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders Card2 with multiple children', () => {
    const {getByText} = render(
      <Card2>
        <Card2.Header>Header Content</Card2.Header>
        <Card2.Body>Body Content</Card2.Body>
        <Card2.Footer>Footer Content</Card2.Footer>
      </Card2>,
    );
    expect(getByText('Header Content')).toBeInTheDocument();
    expect(getByText('Body Content')).toBeInTheDocument();
    expect(getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders Card2 with custom className', () => {
    const {container} = render(<Card2 className="custom-class">Test Content</Card2>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders Card2.Header with custom className', () => {
    const {container} = render(
      <Card2>
        <Card2.Header className="custom-header">Header Content</Card2.Header>
      </Card2>,
    );
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
  });

  it('renders Card2.Body with custom className', () => {
    const {container} = render(
      <Card2>
        <Card2.Body className="custom-body">Body Content</Card2.Body>
      </Card2>,
    );
    expect(container.querySelector('.custom-body')).toBeInTheDocument();
  });

  it('renders Card2.Footer with custom className', () => {
    const {container} = render(
      <Card2>
        <Card2.Footer className="custom-footer">Footer Content</Card2.Footer>
      </Card2>,
    );
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });
});
