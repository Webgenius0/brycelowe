<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'light') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Developer & Metadata Tags -->
    <meta name="author" content="Frontend Developer- Shah Arefin Ahmed & Backend Developer- Mahbube Anam Fuyad" />
    <meta name="developer" content="Arefin, Fuyad" />
    <meta name="designer" content="Dev ninja Team" />
    <meta name="copyright" content="familienerlebnispass.de" />
    <meta name="description" content="familienerlebnispass.de - Discover top partner attractions, membership passes, and instant QR redemptions." />
    <meta name="robots" content="index, follow" />

    <!-- Developer Credit Comment -->
    <!--
      ======================================================
      Developed by Betopia Group
      Lead Frontend Developer: Shah Arefin Ahmed
      Lead Backend Engineer: Mahbube Anam Fuyad
      Project: familienerlebnispass.de Platform
      ======================================================
    -->

    {{-- Inline script to set default light appearance on first visit/login --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? '
            light ' }}';

            if (appearance === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } else {
                document.documentElement.classList.remove('dark');
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    @php
    $setting = \App\Models\SystemSetting::first();

    $faviconUrl = asset('images/favicon.png');
    if ($setting?->favicon) {
    $faviconUrl = (str_starts_with($setting->favicon, 'http://') || str_starts_with($setting->favicon, 'https://'))
    ? $setting->favicon
    : (str_starts_with($setting->favicon, 'storage/') || str_starts_with($setting->favicon, '/storage/')
    ? asset($setting->favicon)
    : asset('storage/' . $setting->favicon));
    }

    $faviconSvgUrl = asset('images/favicon.png');
    if ($setting?->favicon_svg) {
    $faviconSvgUrl = (str_starts_with($setting->favicon_svg, 'http://') || str_starts_with($setting->favicon_svg, 'https://'))
    ? $setting->favicon_svg
    : (str_starts_with($setting->favicon_svg, 'storage/') || str_starts_with($setting->favicon_svg, '/storage/')
    ? asset($setting->favicon_svg)
    : asset('storage/' . $setting->favicon_svg));
    }
    @endphp

    <link rel="icon" href="{{ $faviconUrl }}" sizes="any">

    <link rel="icon" href="{{ $faviconSvgUrl }}" type="image/svg+xml">

    <link rel="apple-touch-icon" href="{{ $faviconUrl }}">

    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    <x-inertia::head>
        <title>{{ $setting?->site_name ?? config('app.name') }}</title>
    </x-inertia::head>
</head>

<body class="font-sans antialiased">
    <x-inertia::app />
</body>

</html>