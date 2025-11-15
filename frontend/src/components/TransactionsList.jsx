import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

const DEFAULT_ITEM_SIZE = 112;

const TransactionsList = ({
  transactions,
  renderItem,
  emptyState,
  height = 360,
  itemSize = DEFAULT_ITEM_SIZE,
  overscanCount = 6,
}) => {
  const listHeight = useMemo(() => {
    if (!transactions.length) {
      return itemSize;
    }
    const totalHeight = transactions.length * itemSize;
    return Math.min(Math.max(itemSize * 2, height), totalHeight);
  }, [transactions.length, itemSize, height]);

  if (!transactions.length) {
    return emptyState || null;
  }

  return (
    <List
      height={listHeight}
      width="100%"
      itemCount={transactions.length}
      itemSize={itemSize}
      overscanCount={overscanCount}
      itemData={{ transactions, renderItem }}
    >
      {RowRenderer}
    </List>
  );
};

const RowRenderer = memo(({ index, style, data }) => {
  const transaction = data.transactions[index];
  return (
    <div style={{ ...style, width: '100%' }}>
      {data.renderItem(transaction, index)}
    </div>
  );
});

export default memo(TransactionsList);
