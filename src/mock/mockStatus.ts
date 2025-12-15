export const statusMockData = [
  { status_id: 1, name: 'Pending', description: 'A aguardar pagamento/confirmação' },
  {
    status_id: 2,
    name: 'Confirmed',
    description: 'Pagamento confirmado, aguardando processamento',
  },
  { status_id: 3, name: 'Shipped', description: 'Enviado para o cliente' },
  { status_id: 4, name: 'Delivered', description: 'Entregue ao cliente' },
  { status_id: 5, name: 'Cancelled', description: 'Encomenda cancelada' },
  { status_id: 6, name: 'Refunded', description: 'Valor devolvido ao cliente' },
  { status_id: 7, name: 'Awaiting Payment', description: 'Aguarda receção do pagamento' },
  { status_id: 8, name: 'Awaiting Shipment', description: 'Aguarda envio da transportadora' },
  { status_id: 9, name: 'Partially Shipped', description: 'Só parte da encomenda foi expedida' },
]
