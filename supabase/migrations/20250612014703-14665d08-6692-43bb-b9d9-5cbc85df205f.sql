
-- Revisar un pago específico que está mostrando "Transferencia" cuando debería ser "Efectivo"
-- Vamos a examinar los datos del pago y su contexto
SELECT 
  cp.id,
  cp.payment_method,
  cp.amount,
  cp.currency,
  cp.payment_date,
  cp.notes,
  cp.created_by,
  p.tracking_number,
  c.name as customer_name,
  c.phone as customer_phone
FROM customer_payments cp
LEFT JOIN packages p ON cp.package_id = p.id
LEFT JOIN customers c ON p.customer_id = c.id
WHERE cp.payment_method IN ('2', 'efectivo', 'transferencia')
ORDER BY cp.payment_date DESC
LIMIT 10;

-- También vamos a ver todos los valores únicos de payment_method para entender el patrón
SELECT 
  payment_method,
  COUNT(*) as count,
  MIN(payment_date) as first_occurrence,
  MAX(payment_date) as last_occurrence
FROM customer_payments
GROUP BY payment_method
ORDER BY count DESC;
