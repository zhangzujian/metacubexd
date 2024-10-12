import Tooltip from '@corvu/tooltip'
import { IconCircleCheckFilled } from '@tabler/icons-solidjs'
import dayjs from 'dayjs'
import { twMerge } from 'tailwind-merge'
import { Latency } from '~/components'
import {
  filterSpecialProxyType,
  formatProxyType,
  getLatencyClassName,
} from '~/helpers'
import { rootElement, useProxies } from '~/signals'

export const ProxyNodeCard = (props: {
  proxyName: string
  isSelected?: boolean
  onClick?: () => void
}) => {
  const { proxyName, isSelected, onClick } = props
  const { proxyNodeMap, proxyLatencyTest, proxyLatencyTestingMap } =
    useProxies()
  const proxyNode = createMemo(() => proxyNodeMap()[proxyName])

  const specialTypes = createMemo(() => {
    if (!filterSpecialProxyType(proxyNode()?.type)) return null

    return `(${[
      proxyNode().xudp && 'xudp',
      proxyNode().udp && 'udp',
      proxyNode().tfo && 'TFO',
    ]
      .filter(Boolean)
      .join(' / ')})`
  })

  const title = createMemo(() =>
    [proxyName, specialTypes()].filter(Boolean).join(' - '),
  )

  return (
    <Tooltip
      placement="top"
      floatingOptions={{
        autoPlacement: true,
        shift: true,
        offset: 10,
      }}
    >
      <Tooltip.Anchor
        class={twMerge(
          'card bg-neutral text-neutral-content',
          isSelected && 'bg-primary text-primary-content',
          onClick && 'cursor-pointer',
        )}
        title={title()}
      >
        <Tooltip.Trigger>
          <div class="card-body space-y-1 p-2.5" onClick={onClick}>
            <h2 class="card-title line-clamp-1 text-start text-sm">
              {proxyName}
            </h2>

            <div class="card-actions items-center justify-between">
              <div class="badge badge-secondary badge-sm font-bold uppercase">
                {formatProxyType(proxyNode()?.type)}
              </div>

              <Latency
                proxyName={props.proxyName}
                class={twMerge(
                  proxyLatencyTestingMap()[proxyName] && 'animate-pulse',
                )}
                onClick={(e) => {
                  e.stopPropagation()

                  void proxyLatencyTest(proxyName, proxyNode().provider)
                }}
              />
            </div>
          </div>
        </Tooltip.Trigger>

        <Tooltip.Portal mount={rootElement()}>
          <Tooltip.Content class="z-50">
            <Tooltip.Arrow class="text-neutral" />

            <div class="flex flex-col items-center gap-2 rounded-box bg-neutral p-2.5 text-neutral-content">
              <h2 class="text-lg font-bold">{proxyName}</h2>

              <div class="w-full text-xs text-neutral-content">
                {specialTypes()}
              </div>

              <ul class="timeline timeline-vertical timeline-compact timeline-snap-icon">
                <For each={proxyNode().latencyTestHistory}>
                  {(latencyTestResult, index) => (
                    <li>
                      <Show when={index() > 0}>
                        <hr />
                      </Show>

                      <div class="timeline-start space-y-2">
                        <time class="text-sm italic">
                          {dayjs(latencyTestResult.time).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )}
                        </time>

                        <div
                          class={twMerge(
                            'badge block',
                            getLatencyClassName(latencyTestResult.delay),
                          )}
                        >
                          {latencyTestResult.delay || '-'}
                        </div>
                      </div>

                      <div class="timeline-middle">
                        <IconCircleCheckFilled class="size-4" />
                      </div>

                      <Show
                        when={
                          index() !== proxyNode().latencyTestHistory.length - 1
                        }
                      >
                        <hr />
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Anchor>
    </Tooltip>
  )
}
