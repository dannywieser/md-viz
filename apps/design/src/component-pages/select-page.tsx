import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@md-viz/ui'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function SelectPage() {
  return (
    <>
      <PageHeading
        title="select"
        description="the shadcn select, several components in one file. the open popup takes its border from the theme's focus color."
      />
      <DemoGroup title="grouped">
        <Select defaultValue="file">
          <SelectTrigger aria-label="source" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>source</SelectLabel>
              <SelectItem value="file">file</SelectItem>
              <SelectItem value="bear">bear</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </DemoGroup>
      <DemoGroup title="with a separator and a placeholder">
        <Select>
          <SelectTrigger aria-label="sort" className="w-48">
            <SelectValue placeholder="sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">title</SelectItem>
            <SelectItem value="created">created</SelectItem>
            <SelectSeparator />
            <SelectItem value="modified">modified</SelectItem>
          </SelectContent>
        </Select>
      </DemoGroup>
      <DemoGroup title="disabled">
        <Select disabled defaultValue="file">
          <SelectTrigger aria-label="disabled source" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="file">file</SelectItem>
          </SelectContent>
        </Select>
      </DemoGroup>
    </>
  )
}
