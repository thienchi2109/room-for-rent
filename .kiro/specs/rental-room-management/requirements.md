# Requirements Document

## Introduction

Hệ thống quản lý phòng cho thuê là một ứng dụng web toàn diện giúp chủ nhà trọ quản lý hiệu quả các hoạt động kinh doanh cho thuê phòng. Hệ thống sử dụng tech stack hiện đại với Next.js frontend, Express.js backend, Prisma ORM, và Neon PostgreSQL database. Hệ thống cung cấp các tính năng từ quản lý thông tin phòng ốc, khách thuê, hợp đồng, đến việc tính toán hóa đơn tự động và báo cáo doanh thu. Với giao diện trực quan và các tính năng tự động hóa, hệ thống giúp tối ưu hóa quy trình quản lý và nâng cao hiệu quả kinh doanh.

## Requirements

### Requirement 1: Quản lý Phòng ốc

**User Story:** Là chủ nhà trọ, tôi muốn quản lý thông tin chi tiết về các phòng và theo dõi trạng thái của chúng, để có thể nắm bắt tình hình tổng thể và đưa ra quyết định kinh doanh phù hợp.

#### Acceptance Criteria

1. WHEN chủ nhà trọ truy cập module quản lý phòng THEN hệ thống SHALL hiển thị danh sách tất cả các phòng với thông tin cơ bản
2. WHEN chủ nhà trọ thêm phòng mới THEN hệ thống SHALL cho phép nhập thông tin phòng (số phòng, tầng, diện tích, loại phòng, giá thuê cơ bản)
3. WHEN chủ nhà trọ cập nhật thông tin phòng THEN hệ thống SHALL lưu trữ các thay đổi và cập nhật trạng thái
4. WHEN chủ nhà trọ xóa phòng THEN hệ thống SHALL kiểm tra phòng không có hợp đồng đang hoạt động trước khi cho phép xóa
5. WHEN hệ thống hiển thị thông tin phòng THEN hệ thống SHALL hiển thị trạng thái phòng (Trống, Đang thuê, Đã cọc, Đang sửa chữa)
6. WHEN chủ nhà trọ truy cập sơ đồ phòng THEN hệ thống SHALL hiển thị lưới các phòng với màu sắc tương ứng trạng thái
7. WHEN chủ nhà trọ click vào một phòng trên sơ đồ THEN hệ thống SHALL hiển thị thông tin chi tiết và các hành động có thể thực hiện

### Requirement 2: Quản lý Khách thuê

**User Story:** Là chủ nhà trọ, tôi muốn lưu trữ và quản lý thông tin chi tiết của khách thuê, để có thể theo dõi lịch sử và thực hiện các thủ tục pháp lý cần thiết.

#### Acceptance Criteria

1. WHEN chủ nhà trọ thêm khách thuê mới THEN hệ thống SHALL cho phép nhập đầy đủ thông tin cá nhân (họ tên, ngày sinh, CCCD, quê quán, số điện thoại)
2. WHEN chủ nhà trọ cập nhật thông tin khách thuê THEN hệ thống SHALL lưu trữ các thay đổi và ghi nhận thời gian cập nhật
3. WHEN chủ nhà trọ xem thông tin khách thuê THEN hệ thống SHALL hiển thị lịch sử thuê phòng của khách hàng đó
4. WHEN chủ nhà trọ quản lý tạm trú THEN hệ thống SHALL cho phép ghi nhận thông tin đăng ký tạm trú và tạm vắng
5. WHEN chủ nhà trọ tìm kiếm khách thuê THEN hệ thống SHALL hỗ trợ tìm kiếm theo tên, CCCD hoặc số điện thoại
6. WHEN chủ nhà trọ xóa thông tin khách thuê THEN hệ thống SHALL kiểm tra khách không có hợp đồng đang hoạt động trước khi cho phép xóa

### Requirement 3: Quản lý Hợp đồng & Thuê phòng

**User Story:** Là chủ nhà trọ, tôi muốn tạo và quản lý hợp đồng thuê phòng, thực hiện check-in/check-out, để đảm bảo quy trình thuê phòng được thực hiện đúng quy định và minh bạch.

#### Acceptance Criteria

1. WHEN chủ nhà trọ tạo hợp đồng mới THEN hệ thống SHALL cho phép liên kết một hoặc nhiều khách thuê với một phòng
2. WHEN tạo hợp đồng THEN hệ thống SHALL yêu cầu nhập ngày bắt đầu thuê, kỳ hạn hợp đồng, và số tiền cọc
3. WHEN chủ nhà trọ thực hiện check-in THEN hệ thống SHALL tự động chuyển trạng thái phòng thành "Đang thuê" và ghi nhận ngày bắt đầu tính tiền
4. WHEN chủ nhà trọ thực hiện check-out THEN hệ thống SHALL hỗ trợ tính hóa đơn cuối cùng và chuyển trạng thái phòng về "Trống"
5. WHEN hợp đồng được tạo THEN hệ thống SHALL lưu trữ tất cả thông tin hợp đồng và tạo mã hợp đồng duy nhất
6. WHEN chủ nhà trọ xem danh sách hợp đồng THEN hệ thống SHALL hiển thị trạng thái hợp đồng (Đang hoạt động, Đã kết thúc, Đã hủy)
7. WHEN hợp đồng sắp hết hạn THEN hệ thống SHALL gửi thông báo nhắc nhở trước 30 ngày

### Requirement 4: Ghi chỉ số & Tính hóa đơn hàng tháng

**User Story:** Là chủ nhà trọ, tôi muốn ghi nhận chỉ số điện nước hàng tháng và tự động tạo hóa đơn, để tiết kiệm thời gian và đảm bảo tính chính xác trong việc tính toán chi phí.

#### Acceptance Criteria

1. WHEN cuối tháng đến THEN hệ thống SHALL hiển thị form ghi chỉ số cho tất cả các phòng đang có người thuê
2. WHEN chủ nhà trọ nhập chỉ số điện nước mới THEN hệ thống SHALL tự động tính lượng tiêu thụ (chỉ số mới - chỉ số cũ)
3. WHEN chỉ số được ghi nhận THEN hệ thống SHALL tự động tạo hóa đơn bao gồm tiền thuê phòng, tiền điện, tiền nước và các dịch vụ khác
4. WHEN tạo hóa đơn THEN hệ thống SHALL sử dụng đơn giá điện/nước đã cài đặt sẵn để tính toán
5. WHEN hóa đơn được tạo THEN hệ thống SHALL gán trạng thái "Chưa thanh toán" và ghi nhận ngày tạo
6. WHEN chủ nhà trọ cập nhật thanh toán THEN hệ thống SHALL cho phép đánh dấu hóa đơn là "Đã thanh toán" và ghi nhận ngày thanh toán
7. WHEN có lỗi trong chỉ số THEN hệ thống SHALL cho phép chỉnh sửa và tính lại hóa đơn

### Requirement 5: Dashboard & Báo cáo Doanh thu

**User Story:** Là chủ nhà trọ, tôi muốn xem tổng quan tình hình kinh doanh và các báo cáo doanh thu, để có thể đánh giá hiệu quả kinh doanh và đưa ra các quyết định chiến lược.

#### Acceptance Criteria

1. WHEN chủ nhà trọ truy cập dashboard THEN hệ thống SHALL hiển thị số phòng trống/tổng số phòng
2. WHEN hiển thị dashboard THEN hệ thống SHALL hiển thị doanh thu tháng hiện tại (đã thu được)
3. WHEN hiển thị dashboard THEN hệ thống SHALL hiển thị số tiền dự kiến thu (từ các hóa đơn chưa thanh toán)
4. WHEN hiển thị dashboard THEN hệ thống SHALL hiển thị danh sách các phòng sắp đến hạn thanh toán
5. WHEN chủ nhà trọ xem báo cáo doanh thu THEN hệ thống SHALL hiển thị biểu đồ cột doanh thu theo từng tháng trong năm
6. WHEN chủ nhà trọ chọn khoảng thời gian THEN hệ thống SHALL cho phép xem báo cáo doanh thu theo khoảng thời gian tùy chỉnh
7. WHEN xuất báo cáo THEN hệ thống SHALL hỗ trợ xuất báo cáo dưới định dạng PDF hoặc Excel

### Requirement 6: Xác thực và Phân quyền

**User Story:** Là chủ nhà trọ, tôi muốn hệ thống có bảo mật tốt và chỉ những người được ủy quyền mới có thể truy cập, để đảm bảo thông tin kinh doanh được bảo vệ an toàn.

#### Acceptance Criteria

1. WHEN người dùng truy cập hệ thống THEN hệ thống SHALL yêu cầu đăng nhập với tên đăng nhập và mật khẩu
2. WHEN đăng nhập thành công THEN hệ thống SHALL tạo JWT token và lưu trữ phiên làm việc
3. WHEN token hết hạn THEN hệ thống SHALL tự động đăng xuất và yêu cầu đăng nhập lại
4. WHEN người dùng không có quyền truy cập THEN hệ thống SHALL từ chối truy cập và hiển thị thông báo lỗi
5. WHEN người dùng đăng xuất THEN hệ thống SHALL xóa token và chuyển hướng về trang đăng nhập

### Requirement 7: Quản lý Cơ sở dữ liệu

**User Story:** Là chủ nhà trọ, tôi muốn hệ thống sử dụng cơ sở dữ liệu đáng tin cậy và hiệu suất cao, để đảm bảo dữ liệu được lưu trữ an toàn và truy xuất nhanh chóng.

#### Acceptance Criteria

1. WHEN hệ thống khởi tạo THEN hệ thống SHALL kết nối với Neon PostgreSQL database
2. WHEN thực hiện các thao tác database THEN hệ thống SHALL sử dụng Prisma ORM để đảm bảo type safety
3. WHEN có lỗi kết nối database THEN hệ thống SHALL thử kết nối lại và ghi log lỗi
4. WHEN thực hiện migration THEN hệ thống SHALL sử dụng Prisma migrate để quản lý schema changes
5. WHEN backup dữ liệu THEN hệ thống SHALL tận dụng tính năng backup tự động của Neon

### Requirement 8: Tự động hóa và Lập lịch

**User Story:** Là chủ nhà trọ, tôi muốn hệ thống tự động thực hiện các tác vụ định kỳ, để giảm thiểu công việc thủ công và đảm bảo không bỏ sót các công việc quan trọng.

#### Acceptance Criteria

1. WHEN cuối tháng đến THEN hệ thống SHALL tự động tạo hóa đơn nháp cho tất cả các phòng đang thuê
2. WHEN hợp đồng sắp hết hạn THEN hệ thống SHALL tự động gửi thông báo nhắc nhở
3. WHEN hóa đơn quá hạn thanh toán THEN hệ thống SHALL gửi thông báo nhắc nợ
4. WHEN có lỗi trong quá trình tự động hóa THEN hệ thống SHALL ghi log lỗi và gửi thông báo cho quản trị viên