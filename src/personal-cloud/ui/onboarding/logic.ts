import type { UIEventHandler } from '@worldbrain/memex-common/lib/main-ui/classes/logic'
import {
    UILogic,
    loadInitial,
    executeUITask,
} from '@worldbrain/memex-common/lib/main-ui/classes/logic'
import { BACKUP_URL } from 'src/constants'
import type { Event, State, Dependencies } from './types'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class CloudOnboardingModalLogic extends UILogic<State, Event> {
    constructor(private dependencies: Dependencies) {
        super()
    }

    getInitialState = (): State => ({
        loadState: 'pristine',
        migrationState: 'pristine',
        dataCleaningState: 'pristine',

        currentUser: null,
        stage: 'data-dump',

        isMigrationPrepped: false,
        giveControlToDumper: false,
        shouldBackupViaDump: false,
        needsToRemovePassiveData: false,
    })

    async init() {
        const {
            authBG,
            backupBG,
            personalCloudBG,
            onModalClose,
        } = this.dependencies
        await loadInitial(this, async () => {
            const user = await authBG.getCurrentUser()

            if (user) {
                this.emitMutation({ currentUser: { $set: user } })
            } else {
                // We can't do the migration if not logged in
                return onModalClose()
            }

            const needsToRemovePassiveData = await personalCloudBG.isPassiveDataRemovalNeeded()
            this.emitMutation({
                needsToRemovePassiveData: { $set: needsToRemovePassiveData },
            })

            const { lastBackup } = await backupBG.getBackupTimes()
            this.emitMutation({
                shouldBackupViaDump: {
                    $set:
                        this.dependencies.browser === 'chrome' &&
                        lastBackup == null,
                },
            })
        })
    }

    private async attemptPassiveDataClean(state: State) {
        const { personalCloudBG, backupBG } = this.dependencies

        await executeUITask(this, 'dataCleaningState', async () => {
            await backupBG.disableRecordingChanges()
            await personalCloudBG.runPassiveDataClean()
        })

        await this.continueToMigration({
            event: null,
            previousState: this.withMutation(state, {
                needsToRemovePassiveData: { $set: false },
            }),
        })
    }

    private async attemptCloudMigration({ isMigrationPrepped }: State) {
        await executeUITask(this, 'migrationState', async () => {
            if (!isMigrationPrepped) {
                await this.dependencies.personalCloudBG.runDataMigrationPreparation()
                this.emitMutation({ isMigrationPrepped: { $set: true } })
            }

            await this.dependencies.personalCloudBG.runDataMigration()
        })
    }

    private _goToBackupRoute = () => {
        window.open(BACKUP_URL, '_self')
    }

    migrateToOldVersion: EventHandler<'migrateToOldVersion'> = ({}) => {
        this.emitMutation({ stage: { $set: 'old-version-backup' } })
    }

    cancelMigrateToOldVersion: EventHandler<
        'cancelMigrateToOldVersion'
    > = ({}) => {
        this.emitMutation({ stage: { $set: 'data-dump' } })
    }

    goToBackupRoute: EventHandler<'goToBackupRoute'> = ({}) =>
        this._goToBackupRoute()

    startDataDump: EventHandler<'cancelDataDump'> = async ({
        previousState,
    }) => {
        if (!previousState.shouldBackupViaDump) {
            this._goToBackupRoute()
            return
        }

        this.emitMutation({ giveControlToDumper: { $set: true } })
    }

    cancelDataDump: EventHandler<'cancelDataDump'> = async ({}) => {
        this.emitMutation({ giveControlToDumper: { $set: false } })
    }

    startDataClean: EventHandler<'startDataClean'> = async ({
        previousState,
    }) => {
        await this.attemptPassiveDataClean(previousState)
    }

    retryDataClean: EventHandler<'retryDataClean'> = async ({
        previousState,
    }) => {
        await this.attemptPassiveDataClean(previousState)
    }

    cancelDataClean: EventHandler<'cancelDataClean'> = async ({}) => {
        this.dependencies.onModalClose()
    }

    retryMigration: EventHandler<'retryMigration'> = async ({
        previousState,
    }) => {
        await this.attemptCloudMigration(previousState)
    }

    cancelMigration: EventHandler<'cancelMigration'> = async ({}) => {
        this.dependencies.onModalClose()
    }

    closeMigration: EventHandler<'closeMigration'> = async ({
        previousState,
    }) => {
        this.dependencies.onModalClose({
            didFinish: previousState.isMigrationPrepped,
        })
    }

    continueToMigration: EventHandler<'continueToMigration'> = async ({
        previousState,
    }) => {
        if (previousState.needsToRemovePassiveData) {
            this.emitMutation({ stage: { $set: 'data-clean' } })
        } else {
            this.emitMutation({ stage: { $set: 'data-migration' } })
            await this.attemptCloudMigration(previousState)
        }
    }

    attemptModalClose: EventHandler<'attemptModalClose'> = async ({
        previousState,
    }) => {
        if (
            previousState.stage === 'data-dump' &&
            !previousState.giveControlToDumper
        ) {
            this.dependencies.onModalClose({ didFinish: false })
        }
    }
}
