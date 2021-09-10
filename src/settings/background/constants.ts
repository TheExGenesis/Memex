import type { UserSettingNames } from './types'

export const COLLECTION_NAMES = {
    settings: 'settings',
}

export const FEATURE_PREFIX = {
    SEARCH_INJECTION: '@SearchInjection-',
    CONTENT_SHARING: '@ContentSharing-',
    PDF_INTEGRATION: '@PDFIntegration-',
    IN_PAGE_UI: '@InPageUI-',
    DASHBOARD: '@Dashboard-',
    EXTENSION: '@Extension-',
}

export const SETTING_NAMES: UserSettingNames = {
    contentSharing: {
        lastSharedAnnotationTimestamp:
            FEATURE_PREFIX.CONTENT_SHARING + 'lastSharedAnnotationTimestamp',
    },
    dashboard: {
        listSidebarLocked: FEATURE_PREFIX.DASHBOARD + 'listSidebarLocked',
        onboardingMsgSeen: FEATURE_PREFIX.DASHBOARD + 'onboardingMsgSeen',
        subscribeBannerDismissed:
            FEATURE_PREFIX.DASHBOARD + 'subscribeBannerDismissed',
    },
    extension: {
        blocklist: FEATURE_PREFIX.EXTENSION + 'blocklist',
        installTime: FEATURE_PREFIX.EXTENSION + 'install_time',
        keyboardShortcuts: FEATURE_PREFIX.EXTENSION + 'keyboard_shortcuts',
        shouldTrackAnalytics:
            FEATURE_PREFIX.EXTENSION + 'should_track_analytics',
    },
    pdfIntegration: {
        shouldAutoOpen: FEATURE_PREFIX.PDF_INTEGRATION + 'should_auto_open',
    },
    inPageUI: {
        ribbonEnabled: FEATURE_PREFIX.IN_PAGE_UI + 'ribbon_enabled',
        tooltipEnabled: FEATURE_PREFIX.IN_PAGE_UI + 'tooltip_enabled',
        highlightsEnabled: FEATURE_PREFIX.IN_PAGE_UI + 'highlights_enabled',
    },
    searchInjection: {
        showMemexResults:
            FEATURE_PREFIX.SEARCH_INJECTION + 'show_memex_results',
        memexResultsPosition:
            FEATURE_PREFIX.SEARCH_INJECTION + 'memex_results_position',
        searchEnginesEnabled:
            FEATURE_PREFIX.SEARCH_INJECTION + 'search_engines_enabled',
    },
}
