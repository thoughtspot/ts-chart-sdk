/**
 * @fileoverview
 * Defines enum for All action types supported in TS, includes context menu actions,
 * answer actions liveboard actions and axis menu actions
 * @author Harshmeet Singh <harshmeet.singh@thoughtspot.com>
 * SDK @version 0.0.2-alpha.26
 */

export enum Action {
    /**
     * The **Save** action for Custom Charts.
     * Allows users to save chart customizations and configurations.
     * @example
     * ```js
     * disabledActions: [Action.Save]
     * ```
     */
    Save = 'save',
    /**
     * @hidden
     */
    Update = 'update',
    /**
     * @hidden
     */
    SaveUntitled = 'saveUntitled',
    /**
     * The **Save as View** action for Custom Charts.
     * Saves a chart configuration as a reusable View object.
     * @example
     * ```js
     * disabledActions: [Action.SaveAsView]
     * ```
     */
    SaveAsView = 'saveAsView',
    /**
     * The **Make a copy** action for Custom Charts.
     * Creates a duplicate of the current chart with all its configurations.
     * Useful for creating variations of existing chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.MakeACopy]
     * ```
     */
    MakeACopy = 'makeACopy',
    /**
     * The **Copy and Edit** action for Custom Charts.
     * This action is now replaced with `Action.MakeACopy`.
     * @example
     * ```js
     * disabledActions: [Action.EditACopy]
     * ```
     */
    EditACopy = 'editACopy',
    /**
     * The **Copy link** menu action for Custom Charts.
     * Copies the chart configuration URL for sharing.
     * @example
     * ```js
     * disabledActions: [Action.CopyLink]
     * ```
     */
    CopyLink = 'embedDocument',
    /**
     * @hidden
     */
    ResetLayout = 'resetLayout',
    /**
     * The **Schedule** menu action for Custom Charts.
     * Allows scheduling automated chart data updates.
     * @example
     * ```js
     * disabledActions: [Action.Schedule]
     * ```
     */
    Schedule = 'subscription',
    /**
     * The **Manage schedules** menu action for Custom Charts.
     * Allows users to manage and configure scheduled chart updates.
     * @example
     * ```js
     * disabledActions: [Action.SchedulesList]
     * ```
     */
    SchedulesList = 'schedule-list',
    /**
     * The **Share** action for Custom Charts.
     * Enables sharing chart configurations and visualizations.
     * @example
     * ```js
     * disabledActions: [Action.Share]
     * ```
     */
    Share = 'share',
    /**
     * The **Add filter** action for Custom Charts.
     * Allows adding data filters to customize chart visualization.
     * @example
     * ```js
     * disabledActions: [Action.AddFilter]
     * ```
     */
    AddFilter = 'addFilter',
    /**
     * The **Add Data Panel Objects** action for Custom Charts.
     * Provides menu options to add formulas, parameters, and other
     * data objects to chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.AddDataPanelObjects]
     * ```
     *
     */
    AddDataPanelObjects = 'addDataPanelObjects',

    /**
     * Filter configuration options for Custom Charts.
     * Allows configuring data filter settings for chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.ConfigureFilter]
     * ```
     */
    ConfigureFilter = 'configureFilter',
    CollapseDataSources = 'collapseDataSources',
    CollapseDataPanel = 'collapseDataPanel',
    /**
     * The **Choose sources** action for Custom Charts.
     * Allows selecting data sources for chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.ChooseDataSources]
     * ```
     */
    ChooseDataSources = 'chooseDataSources',
    /**
     * The **Create formula** action for Custom Charts.
     * Enables adding custom formulas to enhance chart calculations.
     * @example
     * ```js
     * disabledActions: [Action.AddFormula]
     * ```
     */
    AddFormula = 'addFormula',
    /**
     * The **Add parameter** action for Custom Charts.
     * Allows adding configurable parameters to chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.AddParameter]
     * ```
     */
    AddParameter = 'addParameter',
    /**
     * The **Add Column Set** action for Custom Charts.
     * Enables adding column sets to organize chart data.
     * @example
     * ```js
     * disabledActions: [Action.AddColumnSet]
     * ```
     *
     */
    AddColumnSet = 'addSimpleCohort',
    /**
     * The **Add Query Set** action for Custom Charts.
     * Allows adding query sets to define chart data sources.
     * @example
     * ```js
     * disabledActions: [Action.AddQuerySet]
     * ```
     *
     */
    AddQuerySet = 'addAdvancedCohort',
    /**
     * @hidden
     */
    SearchOnTop = 'searchOnTop',
    /**
     * The **SpotIQ analyze** menu action for chart visualizations.
     * Enables AI-powered analysis of chart data.
     * @example
     * ```js
     * disabledActions: [Action.SpotIQAnalyze]
     * ```
     */
    SpotIQAnalyze = 'spotIQAnalyze',
    /**
     * @hidden
     */
    ExplainInsight = 'explainInsight',
    /**
     * @hidden
     */
    SpotIQFollow = 'spotIQFollow',
    ShareViz = 'shareViz',
    /**
     * @hidden
     */
    ReplaySearch = 'replaySearch',
    /**
     * The **Show underlying data** menu action for chart visualizations.
     * Displays the raw data behind the visualization.
     * @example
     * ```js
     * disabledActions: [Action.ShowUnderlyingData]
     * ```
     */
    ShowUnderlyingData = 'showUnderlyingData',
    /**
     * The **Download** menu action for Custom Charts.
     * Enables downloading chart visualizations in various formats.
     * @example
     * ```js
     * disabledActions: [Action.DownloadAsPng]
     * ```
     */
    Download = 'download',
    /**
     * The **Download** > **PNG** menu action for Custom Charts.
     * Downloads the chart visualization as a PNG file.
     * @example
     * ```js
     * disabledActions: [Action.DownloadAsPng]
     * ```
     */
    DownloadAsPng = 'downloadAsPng',

    /**
     *
     * The **Download PDF** action for Custom Charts.
     * Downloads the chart visualization as a PDF file.
     *
     * **NOTE**: The **Download** > **PDF** action is available for
     * chart visualizations with tabular data format.
     * @example
     * ```js
     * disabledActions: [Action.DownloadAsPdf]
     * ```
     */
    DownloadAsPdf = 'downloadAsPdf',
    /**
     * The **Download** > **CSV** menu action for Custom Charts.
     * Downloads the chart data in CSV format.
     * @example
     * ```js
     * disabledActions: [Action.DownloadAsCsv]
     * ```
     */
    DownloadAsCsv = 'downloadAsCSV',
    /**
     * The **Download** > **XLSX** menu action for Custom Charts.
     * Downloads the chart data in XLSX format.
     * @example
     * ```js
     * disabledActions: [Action.DownloadAsXlsx]
     * ```
     */
    DownloadAsXlsx = 'downloadAsXLSX',
    /**
     * @hidden
     */
    DownloadTrace = 'downloadTrace',
    /**
     * The **Export TML** menu action for Custom Charts.
     * Exports the chart configuration as a TML file.
     * @example
     * ```js
     * disabledActions: [Action.ExportTML]
     * ```
     */
    ExportTML = 'exportTSL',
    /**
     * The **Import TML** menu action for Custom Charts.
     * Imports TML configuration for chart customization.
     * @example
     * ```js
     * disabledActions: [Action.ImportTML]
     * ```
     */
    ImportTML = 'importTSL',
    /**
     * The **Update TML** menu action for Custom Charts.
     * Updates existing TML configuration of charts.
     * @example
     * ```js
     * disabledActions: [Action.UpdateTML]
     * ```
     */
    UpdateTML = 'updateTSL',
    /**
     * The **Edit TML** menu action for Custom Charts.
     * Opens the TML editor for chart configuration.
     * @example
     * ```js
     * disabledActions: [Action.EditTML]
     * ```
     */
    EditTML = 'editTSL',
    /**
     * The **Present** menu action for Custom Charts.
     * Enables presentation mode for chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.Present]
     * ```
     */
    Present = 'present',
    /**
     * The resize options in the chart visualization menu.
     * Allows switching between different chart size presets.
     * @example
     * ```js
     * disabledActions: [Action.ToggleSize]
     * ```
     */
    ToggleSize = 'toggleSize',
    /**
     * The **Edit** action for Custom Charts.
     * Opens the chart in edit mode for customization.
     * @example
     * ```js
     * disabledActions: [Action.Edit]
     * ```
     */
    Edit = 'edit',
    /**
     * The text edit option for chart titles and labels.
     * @example
     * ```js
     * disabledActions: [Action.EditTitle]
     * ```
     */
    EditTitle = 'editTitle',

    /**
     * The **Delete** menu action for Custom Charts.
     * Deletes a chart visualization from the configuration.
     * @example
     * ```js
     * disabledActions: [Action.Remove]
     * ```
     */
    Remove = 'delete',
    /**
     * @hidden
     */
    Ungroup = 'ungroup',
    /**
     * @hidden
     */
    Describe = 'describe',
    /**
     * @hidden
     */
    Relate = 'relate',
    /**
     * @hidden
     */
    CustomizeHeadlines = 'customizeHeadlines',
    /**
     * @hidden
     */
    PinboardInfo = 'pinboardInfo',
    /**
     * The **Show Chart Details** menu action.
     * Displays details such as the name, description, author,
     * and timestamp of chart creation and updates.
     * @example
     * ```js
     * disabledActions: [Action.LiveboardInfo]
     * ```
     */
    LiveboardInfo = 'pinboardInfo',
    /**
     * @hidden
     */
    SendAnswerFeedback = 'sendFeedback',
    /**
     * @hidden
     */
    DownloadEmbraceQueries = 'downloadEmbraceQueries',
    /**
     * The **Pin** menu action for Custom Charts.
     * Allows pinning frequently used chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.Pin]
     * ```
     */
    Pin = 'pin',
    /**
     * @hidden
     */
    AnalysisInfo = 'analysisInfo',
    /**
     * The **Schedule** menu action for Custom Charts.
     * @example
     * ```js
     * disabledActions: [Action.Subscription]
     * ```
     */
    Subscription = 'subscription',
    /**
     * The **Explore** action for chart visualizations.
     * Enables interactive exploration of chart data.
     * @example
     * ```js
     * disabledActions: [Action.Explore]
     * ```
     */
    Explore = 'explore',
    /**
     * The action to include data points on a drilled-down chart
     * visualization.
     * @example
     * ```js
     * disabledActions: [Action.DrillInclude]
     * ```
     */
    DrillInclude = 'context-menu-item-include',
    /**
     * The action to exclude data points on a drilled-down chart
     * visualization.
     * @example
     * ```js
     * disabledActions: [Action.DrillExclude]
     * ```
     */
    DrillExclude = 'context-menu-item-exclude',
    /**
     * The **Copy to clipboard** menu action for chart data.
     * Copies the selected data point.
     * @example
     * ```js
     * disabledActions: [Action.CopyToClipboard]
     * ```
     */
    CopyToClipboard = 'context-menu-item-copy-to-clipboard',
    CopyAndEdit = 'context-menu-item-copy-and-edit',
    /**
     * @hidden
     */
    DrillEdit = 'context-menu-item-edit',
    EditMeasure = 'context-menu-item-edit-measure',
    Separator = 'context-menu-item-separator',

    /**
     * The **Drill down** menu action for Custom Charts.
     * Enables drilling down to specific data points in a chart.
     * @example
     * ```js
     * disabledActions: [Action.DrillDown]
     * ```
     */
    DrillDown = 'DRILL',
    /**
     * The request access action for Custom Charts.
     * Allows users with view permissions to request edit access to a chart.
     * @example
     * ```js
     * disabledActions: [Action.RequestAccess]
     * ```
     */
    RequestAccess = 'requestAccess',
    /**
     * The **Query visualizer** and **Query SQL** buttons in Query details panel
     * for chart data exploration.
     * @example
     * ```js
     * disabledActions: [Action.QueryDetailsButtons]
     * ```
     */
    QueryDetailsButtons = 'queryDetailsButtons',
    /**
     * The **Delete** action for chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.AnswerDelete]
     * ```
     *
     */
    AnswerDelete = 'onDeleteAnswer',
    /**
     * The Chart switcher icon for switching between different visualization types.
     * @example
     * ```js
     * disabledActions: [Action.AnswerChartSwitcher]
     * ```
     *
     */
    AnswerChartSwitcher = 'answerChartSwitcher',
    /**
     * Favorites icon (*) for marking frequently used chart configurations
     * @example
     * ```js
     * disabledActions: [Action.AddToFavorites]
     * ```
     *
     */
    AddToFavorites = 'addToFavorites',
    /**
     * The edit icon for chart customization.
     * @example
     * ```js
     * disabledActions: [Action.EditDetails]
     * ```
     *
     */
    EditDetails = 'editDetails',
    /**
     * The Create alert action for KPI chart types.
     * @example
     * ```js
     * disabledActions: [Action.CreateMonitor]
     * ```
     *
     */
    CreateMonitor = 'createMonitor',
    /**
     * @deprecated
     * Reports errors in chart rendering or data processing
     * @example
     * ```js
     * disabledActions: [Action.ReportError]
     * ```
     *
     */
    ReportError = 'reportError',
    /**
     * The **Sync to sheets** action for Custom Charts.
     * Enables sending chart data to Google Sheets.
     * @example
     * ```js
     * disabledActions: [Action.SyncToSheets]
     * ```
     *
     */
    SyncToSheets = 'sync-to-sheets',
    /**
     * The **Sync to other apps** action for Custom Charts.
     * Enables sending chart data to third-party apps like Slack,
     * Salesforce, Microsoft Teams, etc.
     * @example
     * ```js
     * disabledActions: [Action.SyncToOtherApps]
     * ```
     *
     */
    SyncToOtherApps = 'sync-to-other-apps',

    /**
     * The **Manage pipelines** action for Custom Charts.
     * Enables management of data sync pipelines to third-party apps.
     * @example
     * ```js
     * disabledActions: [Action.SyncToOtherApps]
     * ```
     *
     */
    ManagePipelines = 'manage-pipeline',
    /**
     * The **Filter** action for chart visualizations.
     * Enables applying cross-filters on chart data.
     * @example
     * ```js
     * disabledActions: [Action.CrossFilter]
     * ```
     *
     */
    CrossFilter = 'context-menu-item-cross-filter',
    /**
     * The **Sync to Slack** action for chart visualizations.
     * Enables sending chart data to Slack
     * @example
     * ```js
     * disabledActions: [Action.SyncToSlack]
     * ```
     *
     */
    SyncToSlack = 'syncToSlack',
    /**
     * The **Sync to Teams** action for chart visualizations.
     * Enables sending chart data to Microsoft Teams
     * @example
     * ```js
     * disabledActions: [Action.SyncToTeams]
     * ```
     *
     */
    SyncToTeams = 'syncToTeams',
    /**
     * The **Remove** action for cross filters in charts.
     * Removes applied filters from a chart visualization.
     * @example
     * ```js
     * disabledActions: [Action.RemoveCrossFilter]
     * ```
     *
     */
    RemoveCrossFilter = 'context-menu-item-remove-cross-filter',
    /**
     * The **Aggregate** option in chart axis customization.
     * Provides aggregation options for analyzing chart data.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuAggregate]
     * ```
     *
     */
    AxisMenuAggregate = 'axisMenuAggregate',
    /**
     * The **Time bucket** option in chart axis customization.
     * Enables defining time metrics for date comparison in charts.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuTimeBucket]
     * ```
     *
     */
    AxisMenuTimeBucket = 'axisMenuTimeBucket',
    /**
     * The **Filter** action in chart axis customization.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuFilter]
     * ```
     *
     */
    AxisMenuFilter = 'axisMenuFilter',
    /**
     * The **Conditional formatting** action for charts.
     * Enables adding rules for conditional formatting of data points.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuConditionalFormat]
     * ```
     *
     */
    AxisMenuConditionalFormat = 'axisMenuConditionalFormat',

    /**
     * The **Sort** menu action for chart axes.
     * Enables sorting data in ascending or descending order.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuSort]
     * ```
     *
     */
    AxisMenuSort = 'axisMenuSort',
    /**
     * The **Group** option in chart axis customization.
     * Enables grouping data points using same measurement units.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuGroup]
     * ```
     *
     */
    AxisMenuGroup = 'axisMenuGroup',
    /**
     * The **Position** option in chart axis customization.
     * Enables changing axis position in the chart.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuPosition]
     * ```
     *
     */
    AxisMenuPosition = 'axisMenuPosition',
    /**
     * The **Rename** option in chart axis customization.
     * Enables renaming axis labels in the chart.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuRename]
     * ```
     *
     */
    AxisMenuRename = 'axisMenuRename',
    /**
     * The **Edit** action in chart axis customization.
     * Enables editing axis properties including name, position, and format.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuEdit]
     * ```
     *
     */
    AxisMenuEdit = 'axisMenuEdit',
    /**
     * The **Number format** action for chart data labels.
     * Enables customizing number formats in the chart.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuNumberFormat]
     * ```
     *
     */
    AxisMenuNumberFormat = 'axisMenuNumberFormat',
    /**
     * The **Text wrapping** action for chart labels.
     * Enables text wrapping configuration in charts.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuTextWrapping]
     * ```
     *
     */
    AxisMenuTextWrapping = 'axisMenuTextWrapping',
    /**
     * The **Remove** action in chart axis customization.
     * Enables removing axes or data labels from the chart.
     * @example
     * ```js
     * disabledActions: [Action.AxisMenuRemove]
     * ```
     *
     */
    AxisMenuRemove = 'axisMenuRemove',
    /**
     * @hidden
     */
    InsertInToSlide = 'insertInToSlide',
    /**
     * The **Rename** menu action for chart configurations.
     * Enables renaming charts and visualizations.
     * @example
     * ```js
     * disabledActions: [Action.RenameModalTitleDescription]
     * ```
     *
     */
    RenameModalTitleDescription = 'renameModalTitleDescription',
    /**
     * Request verification for chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.RequestVerification]
     * ```
     *
     */
    RequestVerification = 'requestVerification',

    /**
     * Enables marking a chart configuration as verified.
     * @example
     * ```js
     * disabledActions: [Action.MarkAsVerified]
     * ```
     *
     */
    MarkAsVerified = 'markAsVerified',
    /**
     * The **Add Tab** action for chart organization.
     * Enables adding new tabs to organize multiple charts.
     * @example
     * ```js
     * disabledActions: [Action.AddTab]
     * ```
     *
     */
    AddTab = 'addTab',
    /**
     * Initiates contextual change analysis on KPI charts.
     * @example
     * ```js
     * disabledActions: [Action.EnableContextualChangeAnalysis]
     * ```
     *
     */
    EnableContextualChangeAnalysis = 'enableContextualChangeAnalysis',
    /**
     * Displays the Sage query for chart data.
     * @example
     * ```js
     * disabledActions: [Action.ShowSageQuery]
     * ```
     *
     */
    ShowSageQuery = 'showSageQuery',
    /**
     * Enables editing AI-generated chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.EditSageAnswer]
     * ```
     *
     */
    EditSageAnswer = 'editSageAnswer',
    /**
     * Enables providing feedback on AI-generated chart visualizations.
     * @example
     * ```js
     * disabledActions: [Action.SageAnswerFeedback]
     * ```
     *
     */
    SageAnswerFeedback = 'sageAnswerFeedback',
    /**
     * Allows modifications to AI-generated chart configurations.
     * @example
     * ```js
     * disabledActions: [Action.ModifySageAnswer]
     * ```
     *
     */
    ModifySageAnswer = 'modifySageAnswer',
    /**
     * The **Move to Tab** menu action for chart organization.
     * Enables moving charts between different tabs.
     * @example
     * ```js
     * disabledActions: [Action.MoveToTab]
     * ```
     */
    MoveToTab = 'onContainerMove',
    /**
     * The **Manage Alerts** menu action for KPI charts.
     * @example
     * ```js
     * disabledActions: [Action.ManageMonitor]
     * ```
     */
    ManageMonitor = 'manageMonitor',
    /**
     * Action for Personalized Views dropdown in chart configuration
     * @example
     * ```js
     * disabledActions: [Action.PersonalisedViewsDropdown]
     * ```
     *
     */
    PersonalisedViewsDropdown = 'personalisedViewsDropdown',
    /**
     * Action for Recently Visited Users in chart views
     * @example
     * ```js
     * disabledActions: [Action.LiveboardUsers]
     * ```
     *
     */
    LiveboardUsers = 'liveboardUsers',

    /**
     * Action ID for the Parent TML action in chart configurations.
     * The parent action **TML** must be included to access TML-related options
     * for chart customization
     * @example
     * ```js
     * // to include specific TML actions
     * visibleActions: [Action.TML, Action.ExportTML, Action.EditTML]
     *
     * ```
     * @example
     * ```js
     * hiddenAction: [Action.TML] // hide all TML actions
     * disabledActions: [Action.TML] // to disable all TML actions
     * ```
     *
     */
    TML = 'tml',

    /**
     * Action for creating new chart configurations
     * @example
     * ```js
     * hiddenAction: [Action.CreateLiveboard]
     * disabledActions: [Action.CreateLiveboard]
     * ```
     *
     */
    CreateLiveboard = 'createLiveboard',

    /**
     * Action ID for displaying verified chart configurations
     * @example
     * ```js
     * hiddenAction: [Action.VerifiedLiveboard]
     * ```
     *
     */
    VerifiedLiveboard = 'verifiedLiveboard',

    /**
     * Action ID for AI assistant in chart creation
     * @example
     * ```js
     * hiddenAction: [Action.AskAi]
     * ```
     *
     */
    AskAi = 'AskAi',

    /**
     * The **Add KPI to Watchlist** action for monitoring charts.
     * @example
     * ```js
     * disabledActions: [Action.AddToWatchlist]
     * ```
     *
     */
    AddToWatchlist = 'addToWatchlist',

    /**
     * The **Remove from watchlist** menu action for chart monitoring.
     * @example
     * ```js
     * disabledActions: [Action.RemoveFromWatchlist]
     * ```
     *
     */
    RemoveFromWatchlist = 'removeFromWatchlist',

    /**
     * The **Organize Favorites** action for chart management.
     * @example
     * ```js
     * disabledActions: [Action.OrganiseFavourites]
     * ```
     *
     */
    OrganiseFavourites = 'organiseFavourites',

    /**
     * Action ID for AI-powered chart insights
     * @example
     * ```js
     * hiddenAction: [Action.AIHighlights]
     * ```
     *
     */
    AIHighlights = 'AIHighlights',

    /**
     * Action ID for editing scheduled chart updates
     * @example
     * ```js
     * disabledActions: [Action.EditScheduleHomepage]
     * ```
     *
     */
    EditScheduleHomepage = 'editScheduleHomepage',

    /**
     * Action ID for pausing scheduled chart updates
     * @example
     * ```js
     * disabledActions: [Action.PauseScheduleHomepage]
     * ```
     *
     */
    PauseScheduleHomepage = 'pauseScheduleHomepage',

    /**
     * Action ID for viewing scheduled chart update history
     * @example
     * ```js
     * disabledActions: [Action.ViewScheduleRunHomepage]
     * ```
     *
     */
    ViewScheduleRunHomepage = 'viewScheduleRunHomepage',

    /**
     * Action ID for unsubscribing from scheduled chart updates
     * @example
     * ```js
     * disabledActions: [Action.UnsubscribeScheduleHomepage]
     * ```
     *
     */
    UnsubscribeScheduleHomepage = 'unsubscribeScheduleHomepage',

    /**
     * The **Manage Tags** action for chart organization.
     * @example
     * ```js
     * disabledActions: [Action.ManageTags]
     * ```
     *
     */
    ManageTags = 'manageTags',

    /**
     * Action ID for deleting scheduled chart updates
     * @example
     * ```js
     * disabledActions: [Action.DeleteScheduleHomepage]
     * ```
     *
     */
    DeleteScheduleHomepage = 'deleteScheduleHomepage',

    /**
     * The **Analyze CTA** action for KPI charts.
     * Enables deep analysis of KPI visualization data.
     * @example
     * ```js
     * disabledActions: [Action.KPIAnalysisCTA]
     * ```
     *
     */
    KPIAnalysisCTA = 'kpiAnalysisCTA',

    /**
     * Action ID for disabling reordering in chart configurations
     * @example
     * ```js
     * const disabledActions = [Action.DisableChipReorder]
     * ```
     *
     */
    DisableChipReorder = 'disableChipReorder',
}
