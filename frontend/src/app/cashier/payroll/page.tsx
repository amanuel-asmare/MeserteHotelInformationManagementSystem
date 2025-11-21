// frontend/src/app/cashier/payroll/page.tsx
import PayrollClient from './components/PayrollClient';

// Note: Although this is in the "cashier" folder, the backend logic
// will prevent a cashier from accessing it if they try to navigate here directly.
// You might consider moving this to a "/manager" route in the future.
export default function PayrollPage() {
    return <PayrollClient />;
}