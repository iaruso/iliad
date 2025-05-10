export type AlignCellProps =
  | 'left'
  | 'center'
  | 'right'
  | 'justify'
  | 'char'
  | undefined;

export type SkeletonColumn = {
  label: string;
  align: AlignCellProps;
};
