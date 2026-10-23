import { render, screen } from '@testing-library/react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../src'

describe('Card', () => {
  it('renders every part with its slot', () => {
    render(
      <Card className="extra">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    const slots = {
      Title: 'card-title',
      Description: 'card-description',
      Action: 'card-action',
      Body: 'card-content',
      Footer: 'card-footer',
    }
    for (const [text, slot] of Object.entries(slots)) {
      expect(screen.getByText(text)).toHaveAttribute('data-slot', slot)
    }
    expect(screen.getByText('Title').closest('[data-slot="card-header"]')).toBeInTheDocument()
    expect(screen.getByText('Title').closest('[data-slot="card"]')).toHaveClass('extra')
  })
})
