import Button from "@/components/ui-components/Button"
import In
export default function DemoPage(){
return (
  <>
  <div>

<Button variant="primary">Đăng bài</Button>
<Button variant="ghost">Hủy</Button>
<Button variant="outline" disabled>Đang tải...</Button>

  </div>
  <div>
    <Input label="Email" name="email" field />
<Input label="Password" name="password" type="password" field />
<Input label="Search" placeholder="Tìm kiếm..." />

  </div>
    
  </>
)}