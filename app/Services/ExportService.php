<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * Export data to CSV format
     */
    public function toCsv(
        Collection $data,
        array $columns,
        string $filename
    ): StreamedResponse {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate',
            'Expires' => '0',
        ];

        $callback = function () use ($data, $columns) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, $columns);

            foreach ($data as $row) {
                $csvRow = [];

                foreach ($columns as $column) {
                    $csvRow[] = $this->getCellValue($row, $column);
                }

                fputcsv($file, $csvRow);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export data to Excel format
     */
    public function toExcel(
        Collection $data,
        array $columns,
        string $filename,
        array $metadata = []
    ): StreamedResponse {
        if (!class_exists(Spreadsheet::class)) {
            return $this->toCsv($data, $columns, $filename);
        }

        $spreadsheet = new Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data');

        /**
         * Header Row
         */
        foreach ($columns as $index => $column) {

            $cell = Coordinate::stringFromColumnIndex($index + 1) . '1';

            $sheet->setCellValue($cell, $column);

            $sheet->getStyle($cell)
                ->getFont()
                ->setBold(true);
        }

        /**
         * Data Rows
         */
        $rowNumber = 2;

        foreach ($data as $item) {

            foreach ($columns as $index => $column) {

                $cell = Coordinate::stringFromColumnIndex($index + 1) . $rowNumber;

                $sheet->setCellValue(
                    $cell,
                    $this->getCellValue($item, $column)
                );
            }

            $rowNumber++;
        }

        /**
         * Auto Width
         */
        foreach ($columns as $index => $column) {

            $letter = Coordinate::stringFromColumnIndex($index + 1);

            $sheet->getColumnDimension($letter)
                ->setAutoSize(true);
        }

        /**
         * Summary Sheet
         */
        if (!empty($metadata)) {

            $summarySheet = $spreadsheet->createSheet();

            $summarySheet->setTitle('Summary');

            $summaryRow = 1;

            foreach ($metadata as $key => $value) {

                $summarySheet->setCellValue(
                    'A' . $summaryRow,
                    $key
                );

                $summarySheet->setCellValue(
                    'B' . $summaryRow,
                    $value
                );

                $summarySheet->getStyle(
                    'A' . $summaryRow
                )->getFont()->setBold(true);

                $summaryRow++;
            }

            $summarySheet->getColumnDimension('A')
                ->setAutoSize(true);

            $summarySheet->getColumnDimension('B')
                ->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xlsx\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate',
            'Expires' => '0',
        ];

        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            $headers
        );
    }

    /**
     * Get value from row
     */
    private function getCellValue($row, string $column)
    {
        if (is_array($row)) {
            return $row[$column] ?? '';
        }

        if (is_object($row)) {
            return $row->{$column} ?? '';
        }

        return '';
    }

    /**
     * Filter by month
     */
    public function filterByMonth(
        $query,
        string $dateColumn,
        int $month,
        int $year
    ) {
        return $query
            ->whereYear($dateColumn, $year)
            ->whereMonth($dateColumn, $month);
    }

    /**
     * Generate filename
     */
    public function generateFilename(
        string $name,
        bool $addDate = true
    ): string {
        if ($addDate) {
            return $name . '_' . now()->format('Y-m-d_His');
        }

        return $name;
    }

    /**
     * Metadata
     */
    public function getMetadata(
        int $count,
        string $module,
        ?int $month = null,
        ?int $year = null
    ): array {
        $metadata = [
            'Module' => $module,
            'Export Date' => now()->format('Y-m-d H:i:s'),
            'Total Records' => $count,
        ];

        if ($month && $year) {

            $metadata['Period'] = Carbon::create(
                $year,
                $month,
                1
            )->format('F Y');
        }

        return $metadata;
    }
}