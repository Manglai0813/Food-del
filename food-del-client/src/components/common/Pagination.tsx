/**
 * 分頁器コンポーネント
 * シンプルな前後ページ切り替えとページ番号表示
 */

interface PaginationProps {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
        currentPage,
        totalPages,
        onPageChange,
}) => {
        // ページが1つだけの場合は表示しない
        if (totalPages <= 1) {
                return null;
        }

        // ページ番号配列を生成
        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
                <div className="flex justify-center items-center gap-2 my-12">
                        {/* 前のページボタン */}
                        <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`
          px-4 py-2 rounded-md font-medium transition-all
          ${currentPage === 1
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                                        }
        `}
                        >
                                &lt; 前へ
                        </button>

                        {/* ページ番号 */}
                        <div className="flex gap-2">
                                {pageNumbers.map((pageNum) => (
                                        <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                className={`
              w-10 h-10 rounded-md font-medium transition-all
              ${currentPage === pageNum
                                                                ? 'bg-primary text-white scale-110 shadow-md'
                                                                : 'bg-muted text-foreground hover:bg-muted/80 hover:scale-105'
                                                        }
            `}
                                        >
                                                {pageNum}
                                        </button>
                                ))}
                        </div>

                        {/* 次のページボタン */}
                        <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`
          px-4 py-2 rounded-md font-medium transition-all
          ${currentPage === totalPages
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                                        }
        `}
                        >
                                次へ &gt;
                        </button>
                </div>
        );
};
